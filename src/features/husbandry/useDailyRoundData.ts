import { useState, useEffect, useMemo } from 'react';
import { AnimalCategory, DailyRound, Animal, LogType, LogEntry } from '../../types';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

interface AnimalCheckState {
    isAlive?: boolean;
    isWatered: boolean;
    isSecure: boolean;
    securityIssue?: string;
    healthIssue?: string;
}

export function useDailyRoundData(viewDate: string) {
    const [allAnimals, setAllAnimals] = useState<Animal[]>([]);
    const [liveLogs, setLiveLogs] = useState<LogEntry[]>([]);
    const [liveRounds, setLiveRounds] = useState<DailyRound[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [roundType, setRoundType] = useState<'Morning' | 'Evening'>('Morning');
    const [activeTab, setActiveTab] = useState<AnimalCategory>(AnimalCategory.OWLS);
    
    const [checks, setChecks] = useState<Record<string, AnimalCheckState>>({});
    const [signingInitials, setSigningInitials] = useState('');
    const [generalNotes, setGeneralNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const subs: { unsubscribe: () => void }[] = [];

        const loadData = async () => {
            try {
                const db = await bootCoreDatabase();
                if (!db.collections || !db.collections.animals || !db.collections.daily_logs || !db.collections.daily_rounds) {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                // Subscribe to animals
                const animalsSub = db.collections.animals.find().$.subscribe(docs => {
                    if (isMounted) setAllAnimals(docs.map(doc => doc.toJSON() as Animal));
                });
                subs.push(animalsSub);

                // Subscribe to logs
                const logsSub = db.collections.daily_logs.find().$.subscribe(docs => {
                    if (isMounted) setLiveLogs(docs.map(doc => doc.toJSON() as LogEntry));
                });
                subs.push(logsSub);

                // Subscribe to rounds
                const roundsSub = db.collections.daily_rounds.find().$.subscribe(docs => {
                    if (isMounted) {
                        setLiveRounds(docs.map(doc => doc.toJSON() as DailyRound));
                        setIsLoading(false);
                    }
                });
                subs.push(roundsSub);

            } catch (error) {
                console.error("Failed to load daily rounds data", error);
                if (isMounted) setIsLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
            subs.forEach(sub => sub.unsubscribe());
        };
    }, [viewDate]);

    // ... Keep all standard functions identical to your existing file down to the return statement ...
    const currentRound = useMemo(() => liveRounds.find(r => r.shift === roundType && r.section === activeTab), [liveRounds, roundType, activeTab]);
    const isPastRound = currentRound?.status?.toLowerCase() === 'completed';

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentRound?.check_data) {
                setChecks(currentRound.check_data as Record<string, AnimalCheckState>);
            } else {
                setChecks({});
            }
            setSigningInitials(currentRound?.completed_by || '');
            setGeneralNotes(currentRound?.notes || '');
        }, 0);
        return () => clearTimeout(timer);
    }, [viewDate, roundType, activeTab, currentRound]);

    const categoryAnimals = useMemo(() => allAnimals.filter(a => a.category === activeTab), [allAnimals, activeTab]);

    const freezingRisks = useMemo(() => {
        const risks: Record<string, boolean> = {};
        if (!liveLogs) return risks;
        categoryAnimals.forEach(animal => {
            if (animal.water_tipping_temp !== undefined) {
                const tempLog = liveLogs.find(l => l.animal_id === animal.id && l.log_type === LogType.TEMPERATURE);
                if (tempLog && tempLog.temperature_c !== undefined && tempLog.temperature_c <= animal.water_tipping_temp) {
                    risks[animal.id] = true;
                }
            }
        });
        return risks;
    }, [categoryAnimals, liveLogs]);

    const toggleHealth = (id: string, issue?: string) => { 
        setChecks(prev => ({
            ...prev,
            [id]: { ...prev[id], isAlive: prev[id]?.isAlive ? undefined : true, healthIssue: issue }
        }));
    };
    const toggleWater = (id: string) => { 
        setChecks(prev => ({
            ...prev,
            [id]: { ...prev[id], isWatered: !prev[id]?.isWatered }
        }));
    };
    const toggleSecure = (id: string, issue?: string) => { 
        setChecks(prev => ({
            ...prev,
            [id]: { ...prev[id], isSecure: !prev[id]?.isSecure, securityIssue: issue }
        }));
    };

    const completedChecks = useMemo(() => {
        return categoryAnimals.filter(animal => {
            const state = checks[animal.id];
            if (!state) return false;
            return (activeTab === AnimalCategory.OWLS || activeTab === AnimalCategory.RAPTORS) 
                ? (state.isAlive !== undefined && (state.isSecure || Boolean(state.securityIssue)))
                : (state.isAlive !== undefined && state.isWatered && (state.isSecure || Boolean(state.securityIssue)));
        }).length;
    }, [categoryAnimals, checks, activeTab]);

    const totalAnimals = categoryAnimals.length;
    const progress = totalAnimals === 0 ? 0 : Math.round((completedChecks / totalAnimals) * 100);
    const isComplete = totalAnimals > 0 && completedChecks === totalAnimals;
    const isNoteRequired = useMemo(() => false, []);

    const handleSignOff = async () => {
        if (!isComplete || !signingInitials) return;
        setIsSubmitting(true);
        try {
            const db = await bootCoreDatabase();
            const roundId = currentRound?.id || crypto.randomUUID();
            
            const roundData = {
                id: roundId,
                date: viewDate,
                shift: roundType,
                section: activeTab,
                check_data: checks,
                completed_by: signingInitials,
                notes: generalNotes,
                status: 'completed',
                completed_at: new Date().toISOString()
            };

            if (currentRound) {
                const doc = await db.collections.daily_rounds.findOne({ selector: { id: currentRound.id } }).exec();
                if (doc) await doc.patch(roundData);
            } else {
                await db.collections.daily_rounds.insert(roundData);
            }
        } catch (error) {
            console.error('Failed to sign off round:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentUser = { signature_data: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/John_Hancock_signature.png' };

    return { categoryAnimals, isLoading, roundType, setRoundType, activeTab, setActiveTab, checks, progress, isComplete, isNoteRequired, signingInitials, setSigningInitials, generalNotes, setGeneralNotes, isSubmitting, isPastRound, toggleWater, toggleSecure, toggleHealth, handleSignOff, currentUser, completedChecks, totalAnimals, freezingRisks };
}