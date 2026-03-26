import { useState, useEffect } from 'react';
import { bootCoreDatabase } from '../../lib/DatabaseCore';
import { Shift } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const useRotaData = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        const db = await bootCoreDatabase();
        if (!isMounted) return;

        sub = db.collections.shifts.find().$.subscribe(docs => {
          if (isMounted) {
            const rawData = docs.map(d => d.toJSON() as Shift).filter(d => !(d as unknown as { is_deleted?: boolean }).is_deleted);
            const sortedData = rawData.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
            setShifts(sortedData);
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error('Failed to load rota data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const createShift = async (shift: Omit<Shift, 'id' | 'pattern_id'>, repeatDays: number[], weeksToRepeat: number) => {
    const db = await bootCoreDatabase();
    const pattern_id = uuidv4();
    const shiftsToCreate: Shift[] = [];
    
    if (repeatDays.length > 0 && weeksToRepeat > 0) {
      const startDate = new Date(shift.date);
      const startDay = startDate.getDay();
      const diffToMonday = startDate.getDate() - startDay + (startDay === 0 ? -6 : 1);
      const anchorMonday = new Date(startDate);
      anchorMonday.setDate(diffToMonday);

      for (let week = 0; week < weeksToRepeat; week++) {
        for (const day of repeatDays) {
          const date = new Date(anchorMonday);
          const daysToAdd = (day === 0 ? 6 : day - 1) + (week * 7);
          date.setDate(anchorMonday.getDate() + daysToAdd);
          
          if (date >= startDate) {
            shiftsToCreate.push({ 
              ...shift, 
              id: uuidv4(), 
              date: date.toISOString().split('T')[0], 
              pattern_id,
              updated_at: new Date().toISOString(),
              is_deleted: false
            } as Shift);
          }
        }
      }
    } else {
      shiftsToCreate.push({ 
        ...shift, 
        id: uuidv4(), 
        date: shift.date,
        updated_at: new Date().toISOString(),
        is_deleted: false
      } as Shift);
    }

    for (const s of shiftsToCreate) {
      await db.collections.shifts.upsert(s);
    }
  };

  const updateShift = async (id: string, updates: Partial<Shift>, updateSeries: boolean = false) => {
    const db = await bootCoreDatabase();
    if (updateSeries && updates.pattern_id) {
      const seriesShifts = await db.collections.shifts.find({
        selector: { 
          pattern_id: { $eq: updates.pattern_id }
        }
      }).exec();
      
      for (const sDoc of seriesShifts) {
        const s = sDoc.toJSON();
        await db.collections.shifts.upsert({ 
          ...s,
          ...updates, 
          id: s.id, 
          date: s.date,
          updated_at: new Date().toISOString()
        });
      }
    } else {
      const shiftDoc = await db.collections.shifts.findOne(id).exec();
      if (shiftDoc) {
        const s = shiftDoc.toJSON();
        await db.collections.shifts.upsert({ 
          ...s,
          ...updates,
          updated_at: new Date().toISOString()
        });
      }
    }
  };

  const replaceShiftPattern = async (existingShift: Shift, newShiftData: Omit<Shift, 'id' | 'pattern_id'>, repeatDays: number[], weeksToRepeat: number) => {
    const db = await bootCoreDatabase();
    if (existingShift.pattern_id) {
      const futureShifts = await db.collections.shifts.find({
        selector: {
          pattern_id: { $eq: existingShift.pattern_id },
          date: { $gte: existingShift.date }
        }
      }).exec();
      
      for (const sDoc of futureShifts) {
        const s = sDoc.toJSON();
        await db.collections.shifts.upsert({
          ...s,
          is_deleted: true,
          updated_at: new Date().toISOString()
        });
      }
    } else {
      await db.collections.shifts.upsert({
        ...existingShift,
        is_deleted: true,
        updated_at: new Date().toISOString()
      });
    }
    await createShift(newShiftData, repeatDays, weeksToRepeat);
  };

  const deleteShift = async (shift: Shift, deleteSeries: boolean = false) => {
    const db = await bootCoreDatabase();
    if (deleteSeries && shift.pattern_id) {
      const seriesShifts = await db.collections.shifts.find({
        selector: {
          pattern_id: { $eq: shift.pattern_id }
        }
      }).exec();
      
      for (const sDoc of seriesShifts) {
        const s = sDoc.toJSON();
        await db.collections.shifts.upsert({
          ...s,
          is_deleted: true,
          updated_at: new Date().toISOString()
        });
      }
    } else {
      await db.collections.shifts.upsert({
        ...shift,
        is_deleted: true,
        updated_at: new Date().toISOString()
      });
    }
  };

  return { shifts, isLoading, createShift, updateShift, replaceShiftPattern, deleteShift };
};
