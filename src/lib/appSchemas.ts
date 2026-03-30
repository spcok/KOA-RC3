import { RxJsonSchema } from 'rxdb';

export const SYNC_TABLES = [
  'animals', 'archived_animals', 'daily_logs', 'daily_rounds',
  'medical_logs', 'mar_charts', 'quarantine_records',
  'internal_movements', 'external_transfers', 'shifts',
  'holidays', 'timesheets', 'maintenance_logs', 'incidents',
  'first_aid_logs', 'safety_drills', 'operational_lists',
  'users', 'organisations', 'role_permissions', 'contacts',
  'zla_documents', 'bug_reports', 'tasks'
];

const baseProperties = {
  id: { type: 'string', maxLength: 100 },
  created_at: { type: 'string' },
  updated_at: { type: 'string' },
  is_deleted: { type: 'boolean' }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const appSchemas: Record<string, { schema: RxJsonSchema<any> }> = {
  animals: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        entity_type: { type: 'string' },
        parent_mob_id: { type: 'string' },
        census_count: { type: 'number' },
        name: { type: 'string' },
        species: { type: 'string' },
        latin_name: { type: 'string' },
        category: { type: 'string' },
        location: { type: 'string' },
        image_url: { type: 'string' },
        hazard_rating: { type: 'string' },
        is_venomous: { type: 'boolean' },
        weight_unit: { type: 'string' },
        dob: { type: 'string' },
        is_dob_unknown: { type: 'boolean' },
        sex: { type: 'string' },
        microchip_id: { type: 'string' },
        disposition_status: { type: 'string' },
        origin_location: { type: 'string' },
        destination_location: { type: 'string' },
        transfer_date: { type: 'string' },
        ring_number: { type: 'string' },
        has_no_id: { type: 'boolean' },
        red_list_status: { type: 'string' },
        description: { type: 'string' },
        special_requirements: { type: 'string' },
        critical_husbandry_notes: { type: 'array', items: { type: 'string' } },
        target_day_temp_c: { type: 'number' },
        target_night_temp_c: { type: 'number' },
        target_humidity_min_percent: { type: 'number' },
        target_humidity_max_percent: { type: 'number' },
        misting_frequency: { type: 'string' },
        acquisition_date: { type: 'string' },
        origin: { type: 'string' },
        sire_id: { type: 'string' },
        dam_id: { type: 'string' },
        flying_weight_g: { type: 'number' },
        winter_weight_g: { type: 'number' },
        display_order: { type: 'number' },
        archived: { type: 'boolean' },
        archive_reason: { type: 'string' },
        archived_at: { type: 'string' },
        archive_type: { type: 'string' },
        is_quarantine: { type: 'boolean' },
        distribution_map_url: { type: 'string' },
        water_tipping_temp: { type: 'number' },
        acquisition_type: { type: 'string' }
      },
      required: ['id', 'name', 'species', 'category', 'location']
    }
  },
  daily_logs: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        animal_id: { type: 'string' },
        log_type: { type: 'string' },
        log_date: { type: 'string' },
        value: { type: 'string' },
        notes: { type: 'string' },
        user_initials: { type: 'string' },
        weight_grams: { type: 'number' },
        weight: { type: 'number' },
        weight_unit: { type: 'string' },
        health_record_type: { type: 'string' },
        basking_temp_c: { type: 'number' },
        cool_temp_c: { type: 'number' },
        temperature_c: { type: 'number' },
        created_by: { type: 'string' },
        integrity_seal: { type: 'string' }
      },
      required: ['id', 'animal_id', 'log_type', 'log_date', 'value']
    }
  },
  daily_rounds: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: { type: 'string', maxLength: 100 },
        date: { type: 'string' },
        shift: { type: 'string' },
        section: { type: 'string' },
        check_data: { type: 'object', additionalProperties: true },
        status: { type: 'string' },
        completed_by: { type: 'string' },
        completed_at: { type: 'string' },
        updated_at: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['id', 'date', 'shift', 'section', 'status']
    }
  },
  medical_logs: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        animal_id: { type: 'string' },
        animal_name: { type: 'string' },
        date: { type: 'string' },
        note_type: { type: 'string' },
        note_text: { type: 'string' },
        recheck_date: { type: 'string' },
        staff_initials: { type: 'string' },
        attachment_url: { type: 'string' },
        thumbnail_url: { type: 'string' },
        diagnosis: { type: 'string' },
        bcs: { type: 'number' },
        weight_grams: { type: 'number' },
        weight: { type: 'number' },
        weight_unit: { type: 'string' },
        treatment_plan: { type: 'string' },
        integrity_seal: { type: 'string' }
      },
      required: ['id', 'animal_id', 'date', 'note_type', 'note_text']
    }
  },
  mar_charts: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        animal_id: { type: 'string' },
        animal_name: { type: 'string' },
        medication: { type: 'string' },
        dosage: { type: 'string' },
        frequency: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
        status: { type: 'string' },
        instructions: { type: 'string' },
        administered_dates: { type: 'array', items: { type: 'string' } },
        staff_initials: { type: 'string' },
        integrity_seal: { type: 'string' }
      },
      required: ['id', 'animal_id', 'medication', 'dosage', 'frequency', 'start_date']
    }
  },
  quarantine_records: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        animal_id: { type: 'string' },
        animal_name: { type: 'string' },
        reason: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
        status: { type: 'string' },
        isolation_notes: { type: 'string' },
        staff_initials: { type: 'string' }
      },
      required: ['id', 'animal_id', 'reason', 'start_date', 'status']
    }
  },
  internal_movements: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        animal_id: { type: 'string' },
        animal_name: { type: 'string' },
        log_date: { type: 'string' },
        movement_type: { type: 'string' },
        source_location: { type: 'string' },
        destination_location: { type: 'string' },
        notes: { type: 'string' },
        created_by: { type: 'string' }
      },
      required: ['id', 'animal_id', 'log_date', 'movement_type', 'source_location', 'destination_location']
    }
  },
  external_transfers: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        animal_id: { type: 'string' },
        animal_name: { type: 'string' },
        transfer_type: { type: 'string' },
        date: { type: 'string' },
        institution: { type: 'string' },
        transport_method: { type: 'string' },
        cites_article_10_ref: { type: 'string' },
        status: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['id', 'animal_id', 'transfer_type', 'date', 'institution']
    }
  },
  shifts: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        user_id: { type: 'string' },
        user_name: { type: 'string' },
        user_role: { type: 'string' },
        date: { type: 'string' },
        shift_type: { type: 'string' },
        start_time: { type: 'string' },
        end_time: { type: 'string' },
        assigned_area: { type: 'string' },
        notes: { type: 'string' },
        pattern_id: { type: 'string' }
      },
      required: ['id', 'user_id', 'date', 'shift_type']
    }
  },
  holidays: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        staff_name: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
        leave_type: { type: 'string' },
        status: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['id', 'staff_name', 'start_date', 'end_date', 'leave_type', 'status']
    }
  },
  timesheets: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        staff_name: { type: 'string' },
        date: { type: 'string' },
        clock_in: { type: 'string' },
        clock_out: { type: 'string' },
        total_hours: { type: 'number' },
        notes: { type: 'string' },
        status: { type: 'string' }
      },
      required: ['id', 'staff_name', 'date', 'clock_in', 'status']
    }
  },
  maintenance_logs: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        enclosure_id: { type: 'string' },
        task_type: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string' },
        date_logged: { type: 'string' },
        date_completed: { type: 'string' },
        integrity_seal: { type: 'string' }
      },
      required: ['id', 'enclosure_id', 'task_type', 'description', 'status', 'date_logged']
    }
  },
  incidents: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        date: { type: 'string' },
        time: { type: 'string' },
        type: { type: 'string' },
        severity: { type: 'string' },
        description: { type: 'string' },
        location: { type: 'string' },
        status: { type: 'string' },
        reported_by: { type: 'string' }
      },
      required: ['id', 'date', 'time', 'type', 'severity', 'description']
    }
  },
  first_aid_logs: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        date: { type: 'string' },
        time: { type: 'string' },
        person_name: { type: 'string' },
        type: { type: 'string' },
        description: { type: 'string' },
        treatment: { type: 'string' },
        location: { type: 'string' },
        outcome: { type: 'string' }
      },
      required: ['id', 'date', 'time', 'person_name', 'type', 'description', 'treatment']
    }
  },
  safety_drills: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        date: { type: 'string' },
        title: { type: 'string' },
        location: { type: 'string' },
        priority: { type: 'string' },
        status: { type: 'string' },
        description: { type: 'string' },
        timestamp: { type: 'number' }
      },
      required: ['id', 'date', 'title', 'location', 'status']
    }
  },
  operational_lists: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: { type: 'string', maxLength: 100 },
        type: { type: 'string' },
        category: { type: 'string' },
        value: { type: 'string' },
        is_deleted: { type: 'boolean' },
        updated_at: { type: 'string' }
      },
      required: ['id', 'type', 'value']
    }
  },
  users: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: { type: 'string', maxLength: 100 },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        initials: { type: 'string' },
        pin: { type: 'string' },
        job_position: { type: 'string' },
        permissions: { type: 'object', additionalProperties: true },
        signature_data: { type: 'string' },
        integrity_seal: { type: 'string' }
      },
      required: ['id', 'email', 'name', 'role', 'initials']
    }
  },
  organisations: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: { type: 'string', maxLength: 100 },
        org_name: { type: 'string' },
        logo_url: { type: 'string' },
        contact_email: { type: 'string' },
        contact_phone: { type: 'string' },
        address: { type: 'string' },
        zla_license_number: { type: 'string' },
        official_website: { type: 'string' },
        adoption_portal: { type: 'string' }
      },
      required: ['id', 'org_name', 'contact_email', 'contact_phone', 'address', 'zla_license_number']
    }
  },
  role_permissions: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: { type: 'string', maxLength: 100 },
        role: { type: 'string' },
        view_animals: { type: 'boolean' },
        add_animals: { type: 'boolean' },
        edit_animals: { type: 'boolean' },
        archive_animals: { type: 'boolean' },
        view_daily_logs: { type: 'boolean' },
        create_daily_logs: { type: 'boolean' },
        edit_daily_logs: { type: 'boolean' },
        view_tasks: { type: 'boolean' },
        complete_tasks: { type: 'boolean' },
        manage_tasks: { type: 'boolean' },
        view_daily_rounds: { type: 'boolean' },
        log_daily_rounds: { type: 'boolean' },
        view_medical: { type: 'boolean' },
        add_clinical_notes: { type: 'boolean' },
        prescribe_medications: { type: 'boolean' },
        administer_medications: { type: 'boolean' },
        manage_quarantine: { type: 'boolean' },
        view_movements: { type: 'boolean' },
        log_internal_movements: { type: 'boolean' },
        manage_external_transfers: { type: 'boolean' },
        view_incidents: { type: 'boolean' },
        report_incidents: { type: 'boolean' },
        manage_incidents: { type: 'boolean' },
        view_maintenance: { type: 'boolean' },
        report_maintenance: { type: 'boolean' },
        resolve_maintenance: { type: 'boolean' },
        view_safety_drills: { type: 'boolean' },
        view_first_aid: { type: 'boolean' },
        submit_timesheets: { type: 'boolean' },
        manage_all_timesheets: { type: 'boolean' },
        request_holidays: { type: 'boolean' },
        approve_holidays: { type: 'boolean' },
        view_missing_records: { type: 'boolean' },
        view_archived_records: { type: 'boolean' },
        manage_zla_documents: { type: 'boolean' },
        generate_reports: { type: 'boolean' },
        view_settings: { type: 'boolean' },
        manage_users: { type: 'boolean' },
        manage_roles: { type: 'boolean' }
      },
      required: ['id', 'role']
    }
  },
  contacts: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        role: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        address: { type: 'string' }
      },
      required: ['id', 'name']
    }
  },
  zla_documents: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        category: { type: 'string' },
        file_url: { type: 'string' },
        upload_date: { type: 'string' }
      },
      required: ['id', 'name', 'file_url']
    }
  },
  bug_reports: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        message: { type: 'string' },
        is_online: { type: 'boolean' },
        url: { type: 'string' },
        role: { type: 'string' },
        user_name: { type: 'string' }
      },
      required: ['id', 'message', 'url', 'role', 'user_name']
    }
  },
  tasks: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        ...baseProperties,
        animal_id: { type: 'string' },
        title: { type: 'string' },
        notes: { type: 'string' },
        due_date: { type: 'string' },
        completed: { type: 'boolean' },
        type: { type: 'string' },
        recurring: { type: 'boolean' },
        assigned_to: { type: 'string' }
      },
      required: ['id', 'title', 'due_date', 'completed']
    }
  }
};

// archived_animals uses the same schema as animals
// We use a deep clone to prevent RxDB's internal schema mutation from causing collisions
appSchemas.archived_animals = { 
  schema: JSON.parse(JSON.stringify(appSchemas.animals.schema)) 
};
