import { bootCoreDatabase } from '../lib/DatabaseCore';

export const runFeedDataMigration = async () => {
  console.log("🛠️ [Migration] Starting Legacy FEED Log Normalization...");
  
  try {
    const db = await bootCoreDatabase();
    
    // Find all FEED logs that are not deleted
    const feedLogs = await db.daily_records.find({
      selector: {
        log_type: 'FEED',
        is_deleted: false
      }
    }).exec();

    let updatedCount = 0;

    for (const doc of feedLogs) {
      const rawValue = doc.get('value');
      if (!rawValue) continue;

      // Handle comma-separated multiple items (e.g., "Item 1 - Qty, Item 2 - Qty")
      const items = rawValue.split(', ');
      let needsUpdate = false;

      const normalizedItems = items.map((item: string) => {
        const parts = item.split(' - ');
        
        // If there are more than 2 parts, it's the legacy format (e.g., "Mice - Small - 2")
        if (parts.length > 2) {
          needsUpdate = true;
          const quantity = parts.pop()?.trim() || '1';
          const foodType = parts.join(' - ').trim();
          return `${foodType} - ${quantity}`;
        }
        return item; // Keep as is if already normalized
      });

      if (needsUpdate) {
        const newValue = normalizedItems.join(', ');
        await doc.patch({ value: newValue });
        updatedCount++;
      }
    }

    console.log(`✅ [Migration] Complete! Normalized ${updatedCount} legacy FEED logs.`);
    alert(`Success! Normalized ${updatedCount} legacy records.`);
    
  } catch (error) {
    console.error("❌ [Migration] Failed to normalize feed logs:", error);
    alert("Migration failed. Check console for details.");
  }
};
