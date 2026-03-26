import { createRxDatabase, RxDatabase, RxJsonSchema } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateSupabase, RxSupabaseReplicationState } from 'rxdb/plugins/replication-supabase';
import { supabase } from './supabase';
import { Subscription } from 'rxjs';

const supabaseManifest = {};

interface KoaWindow extends Window {
  __KOA_DB_PROMISE: Promise<RxDatabase> | null;
  __KOA_DB_INSTANCE: RxDatabase | null;
}

const SYNC_TABLES = [
  'animals', 'archived_animals',
  'daily_logs', 'daily_rounds',
  'medical_logs', 'mar_charts', 'quarantine_records',
  'internal_movements', 'external_transfers',
  'shifts', 'holidays', 'timesheets',
  'maintenance_logs', 'incidents', 'first_aid_logs', 'safety_drills',
  'operational_lists', 'users', 'organisations', 'role_permissions',
  'contacts', 'zla_documents', 'bug_reports', 'tasks'
];

const makeProps = (keys: string[]) => keys.reduce((acc, key) => ({ ...acc, [key]: { type: ['string', 'number', 'boolean', 'null', 'array', 'object'] } }), {});
const baseProps = { id: { type: 'string', maxLength: 100 }, is_deleted: { type: 'boolean' }, ...makeProps(['created_at', 'updated_at']) };

const animalKeys = ['entity_type', 'parent_mob_id', 'census_count', 'name', 'species', 'latin_name', 'category', 'location', 'image_url', 'hazard_rating', 'is_venomous', 'weight_unit', 'dob', 'is_dob_unknown', 'sex', 'microchip_id', 'disposition_status', 'origin_location', 'destination_location', 'transfer_date', 'ring_number', 'has_no_id', 'red_list_status', 'description', 'special_requirements', 'critical_husbandry_notes', 'target_day_temp_c', 'target_night_temp_c', 'target_humidity_min_percent', 'target_humidity_max_percent', 'misting_frequency', 'acquisition_date', 'origin', 'sire_id', 'dam_id', 'flying_weight_g', 'winter_weight_g', 'display_order', 'archived', 'archive_reason', 'archived_at', 'archive_type', 'is_quarantine', 'distribution_map_url', 'water_tipping_temp', 'acquisition_type', 'microchip_number', 'birth_date', 'gender', 'website'];
const adminKeys = ['email', 'name', 'role', 'initials', 'job_position', 'permissions', 'signature_data', 'pin', 'deleted_at', 'integrity_seal', 'org_name', 'logo_url', 'contact_email', 'contact_phone', 'address', 'zla_license_number', 'official_website', 'adoption_portal', 'message', 'is_online', 'url', 'user_name', 'view_animals', 'edit_animals', 'view_daily_logs', 'view_tasks', 'view_daily_rounds', 'view_medical', 'edit_medical', 'view_movements', 'view_incidents', 'view_maintenance', 'view_safety_drills', 'view_first_aid', 'view_timesheets', 'view_holidays', 'view_missing_records', 'generate_reports', 'view_settings', 'manage_access_control', 'add_animals', 'archive_animals', 'delete_animals', 'create_daily_logs', 'edit_daily_logs', 'complete_tasks', 'manage_tasks', 'log_daily_rounds', 'add_clinical_notes', 'prescribe_medications', 'administer_medications', 'manage_quarantine', 'log_internal_movements', 'manage_external_transfers', 'report_incidents', 'manage_incidents', 'report_maintenance', 'resolve_maintenance', 'submit_timesheets', 'manage_all_timesheets', 'request_holidays', 'approve_holidays', 'manage_zla_documents', 'manage_users', 'manage_roles', 'view_archived_records', 'type', 'value', 'is_enabled', 'permission_key', 'role_id'];
const dailyKeys = ['animal_id', 'log_type', 'log_date', 'date', 'value', 'notes', 'shift', 'section', 'status', 'completed_by', 'completedBy', 'completed_at', 'check_data', 'temperature_c', 'basking_temp_c', 'cool_temp_c', 'created_by', 'health_record_type', 'weight_grams', 'weight', 'weight_unit', 'user_initials', 'integrity_seal'];
const clinicalKeys = ['animal_id', 'animal_name', 'date', 'note_type', 'note_text', 'recheck_date', 'staff_initials', 'attachment_url', 'thumbnail_url', 'diagnosis', 'bcs', 'weight_grams', 'weight', 'weight_unit', 'treatment_plan', 'integrity_seal', 'medication', 'dosage', 'frequency', 'status', 'start_date', 'end_date', 'reason', 'isolation_notes'];
const logisticsKeys = ['animal_id', 'animal_name', 'log_date', 'date', 'movement_type', 'transfer_type', 'source_location', 'destination_location', 'institution', 'status', 'created_by', 'notes'];
const staffKeys = ['user_id', 'staff_name', 'date', 'start_date', 'end_date', 'clock_in', 'clock_out', 'status', 'shift_type', 'leave_type'];
const maintenanceKeys = ['enclosure_id', 'task_type', 'description', 'status', 'date_logged', 'date_completed'];
const incidentKeys = ['date', 'time', 'type', 'severity', 'description', 'location', 'status', 'reported_by'];
const firstAidKeys = ['date', 'time', 'person_name', 'type', 'description', 'treatment', 'location', 'outcome'];
const safetyDrillKeys = ['date', 'title', 'location', 'priority', 'status', 'description'];
const listKeys = ['type', 'category', 'value'];
const taskKeys = ['animal_id', 'title', 'due_date', 'completed', 'assigned_to', 'type', 'notes'];

// 🚨 CRITICAL FIX: Destroy the database cache when the page is hard-refreshed 
// to prevent Vite from holding onto zombified IndexedDB connections.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const koaWindow = window as unknown as KoaWindow;
    delete koaWindow.__KOA_DB_PROMISE;
    delete koaWindow.__KOA_DB_INSTANCE;
  });
}

export const bootCoreDatabase = async (): Promise<RxDatabase> => {
  const koaWindow = window as unknown as KoaWindow;
  if (koaWindow.__KOA_DB_INSTANCE) return koaWindow.__KOA_DB_INSTANCE;
  if (koaWindow.__KOA_DB_PROMISE) return koaWindow.__KOA_DB_PROMISE;

  console.log("🛡️ [Core DB] Booting Immortal Engine...");

  koaWindow.__KOA_DB_PROMISE = (async () => {
    try {
      const db = await createRxDatabase({
        name: 'koa_manager_phoenix_v2',
        storage: getRxStorageDexie(),
      });

      const schemaTemplate = (keys: string[]): RxJsonSchema<Record<string, unknown>> => ({
        version: 0,
        primaryKey: 'id',
        type: 'object',
        additionalProperties: false,
        properties: { ...baseProps, ...makeProps(keys) },
        required: ['id']
      });

      const appSchemas = {
        animals: { schema: schemaTemplate(animalKeys) },
        archived_animals: { schema: schemaTemplate(animalKeys) },
        daily_logs: { schema: schemaTemplate(dailyKeys) },
        daily_rounds: { schema: schemaTemplate(dailyKeys) },
        medical_logs: { schema: schemaTemplate(clinicalKeys) },
        mar_charts: { schema: schemaTemplate(clinicalKeys) },
        quarantine_records: { schema: schemaTemplate(clinicalKeys) },
        internal_movements: { schema: schemaTemplate(logisticsKeys) },
        external_transfers: { schema: schemaTemplate(logisticsKeys) },
        shifts: { schema: schemaTemplate(staffKeys) },
        holidays: { schema: schemaTemplate(staffKeys) },
        timesheets: { schema: schemaTemplate(staffKeys) },
        maintenance_logs: { schema: schemaTemplate(maintenanceKeys) },
        incidents: { schema: schemaTemplate(incidentKeys) },
        first_aid_logs: { schema: schemaTemplate(firstAidKeys) },
        safety_drills: { schema: schemaTemplate(safetyDrillKeys) },
        operational_lists: { schema: schemaTemplate(listKeys) },
        users: { schema: schemaTemplate(adminKeys) },
        organisations: { schema: schemaTemplate(adminKeys) },
        role_permissions: { schema: schemaTemplate(adminKeys) },
        contacts: { schema: schemaTemplate(adminKeys) },
        zla_documents: { schema: schemaTemplate(adminKeys) },
        bug_reports: { schema: schemaTemplate(adminKeys) },
        tasks: { schema: schemaTemplate(taskKeys) }
      };

      // Only add collections if they haven't been added yet
      if (!db.collections.animals) {
        await db.addCollections(appSchemas);
      }

      koaWindow.__KOA_DB_INSTANCE = db;
      return db;
    } catch (error: unknown) {
      koaWindow.__KOA_DB_PROMISE = null;
      throw error;
    }
  })();

  return koaWindow.__KOA_DB_PROMISE;
};

export const destroyCoreDatabase = async () => {
  console.log("🛑 [Core DB] Database destruction bypassed for stability.");
};

const activeReplications: RxSupabaseReplicationState<unknown>[] = [];
const errorSubscriptions: Subscription[] = [];
let isSyncStarting = false;

export const startCoreSync = async () => {
  if (isSyncStarting) return;
  isSyncStarting = true;

  try {
    // Debounce/Cooldown to allow network to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    const db = await bootCoreDatabase();

    if (!navigator.onLine) {
      console.warn("⚠️ [Sync] Offline. Background replication suspended.");
      return;
    }

    console.log("📡 [Sync] Online. Engaging Supabase Replication...");

    // 🚨 CRITICAL FIX: Deep Disposal of existing replications
    await Promise.all(activeReplications.map(state => state.cancel()));
    activeReplications.length = 0;

    // 🚨 CRITICAL FIX: Clean up error subscriptions
    errorSubscriptions.forEach(sub => sub.unsubscribe());
    errorSubscriptions.length = 0;

    for (const tableName of SYNC_TABLES) {
      const collection = db.collections[tableName];
      if (!collection) continue;

      try {
        const state = replicateSupabase({
          collection,
          replicationIdentifier: `core_${tableName}_sync_v7`,
          client: supabase,
          tableName: tableName,
          deletedField: 'is_deleted',
          pull: { 
            batchSize: 100, 
            modifier: (doc: Record<string, unknown>) => {
              const cleanDoc = { ...doc };
              if (!cleanDoc.id) cleanDoc.id = crypto.randomUUID(); 
              return { 
                ...cleanDoc, 
                id: String(cleanDoc.id)
              };
            } 
          },
          push: { 
            modifier: (doc: Record<string, unknown>) => {
              const cleanDoc = { ...doc };
              
              const allowedColumns = (supabaseManifest as Record<string, string[]>)[tableName] || [];
              
              Object.keys(cleanDoc).forEach(key => {
                if (key !== 'is_deleted' && key !== '_deleted' && !allowedColumns.includes(key)) {
                  delete cleanDoc[key];
                }
              });
              
              return cleanDoc;
            } 
          },
          live: true, 
          retryTime: 5000 
        });
        
        // 🚨 CRITICAL FIX: Scoped error subscription
        const errorSub = state.error$.subscribe(err => {
           if (err instanceof Error && err.message && !err.message.includes('Offline')) {
               console.error(`[Core Sync Error] ${tableName}:`, err);
           }
        });
        
        activeReplications.push(state);
        errorSubscriptions.push(errorSub);
      } catch (err: unknown) {
        console.error(`[Sync Setup Failed] ${tableName}:`, err);
      }
    }
  } finally {
    isSyncStarting = false;
  }
};