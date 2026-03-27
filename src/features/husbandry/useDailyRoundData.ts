import { useState, useEffect, useMemo } from 'react';
import { AnimalCategory, DailyRound, Animal, LogType, LogEntry } from '../../types';

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
        let subs: Subscription[] = [];

        const loadData = async () => {
            try {
                console.log("☢️ [Zero Dawn] Daily round data loading is neutralized.");
                if (isMounted) {
                    setAllAnimals([]);
                    setLiveLogs([]);
                    setLiveRounds([]);
                    setIsLoading(false);
                }
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
    const currentRoundId = currentRound?.id;
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
            console.log("☢️ [Zero Dawn] Sign off daily round is neutralized.");
            alert("Database engine is neutralized. Round cannot be signed off.");
        } catch (error) {
            console.error('Failed to sign off round:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentUser = { signature_data: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/John_Hancock_signature.png' };

    return { categoryAnimals, isLoading, roundType, setRoundType, activeTab, setActiveTab, checks, progress, isComplete, isNoteRequired, signingInitials, setSigningInitials, generalNotes, setGeneralNotes, isSubmitting, isPastRound, toggleWater, toggleSecure, toggleHealth, handleSignOff, currentUser, completedChecks, totalAnimals, freezingRisks };
}