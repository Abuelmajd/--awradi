import React, { useState, useMemo, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { Page, Wird, WirdType, PRAYER_NAMES, WirdGroup, DAYS_OF_WEEK } from '../types';
import { SunIcon, MoonIcon, PlusIcon, BookOpenIcon, PersonLinkedIcon, RectangleStackIcon, PencilIcon, CalendarDaysIcon, ChevronDownIcon } from '../components/Icons';

interface AwradListScreenProps {
  navigate: (page: Page, params?: any) => void;
  awrad: Wird[];
  wirdGroups: WirdGroup[];
}

const getDayNames = (days: number[] | undefined) => {
    if (!days || days.length === 0) return '';
    if (days.length === 7) return 'كل يوم';
    return days.map(d => DAYS_OF_WEEK[d]).join('، ');
}


const getWirdIcon = (wird: Wird) => {
    const props = { className: 'w-6 h-6' };
    if (wird.type === WirdType.PRAYER_LINKED) return <PersonLinkedIcon {...props} />;
    if (wird.type === WirdType.DAY_SPECIFIC) return <CalendarDaysIcon {...props} />;
    if (wird.name.toLowerCase().includes("صباح")) return <SunIcon {...props} />;
    if (wird.name.toLowerCase().includes("مساء")) return <MoonIcon {...props} />;
    if (wird.name.toLowerCase().includes("نوم")) return <MoonIcon {...props} />;
    return <BookOpenIcon {...props} />;
};

const AwradListScreen: React.FC<AwradListScreenProps> = ({ navigate, awrad, wirdGroups }) => {
    const [activeTab, setActiveTab] = useState<'groups' | 'individual'>('individual');
    const [expandedGroupIds, setExpandedGroupIds] = useState<Set<number>>(() => new Set(wirdGroups.map(g => g.id)));
    const prevWirdGroupsRef = useRef(wirdGroups);

    useEffect(() => {
        // This effect ensures newly added groups are expanded by default.
        if (wirdGroups.length > prevWirdGroupsRef.current.length) {
            const newGroup = wirdGroups.find(g => !prevWirdGroupsRef.current.some(pg => pg.id === g.id));
            if (newGroup) {
                setExpandedGroupIds(prev => new Set(prev).add(newGroup.id));
            }
        }
        prevWirdGroupsRef.current = wirdGroups;
    }, [wirdGroups]);

    const toggleGroup = (groupId: number) => {
        setExpandedGroupIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };

    const ungroupedAwrad = useMemo(() => {
        const groupedWirdIds = new Set(wirdGroups.flatMap(g => g.wirdIds));
        return awrad.filter(w => !groupedWirdIds.has(w.id));
    }, [awrad, wirdGroups]);
    
    const getWirdDescription = (wird: Wird) => {
        switch(wird.type) {
            case WirdType.PRAYER_LINKED:
                return `بعد ${PRAYER_NAMES[wird.linkedPrayer!]}`;
            case WirdType.DAY_SPECIFIC:
                const days = getDayNames(wird.specificDays);
                return days ? `أيام: ${days}` : 'أيام محددة';
            case WirdType.DAILY:
            default:
                return 'يومي';
        }
    };


    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <Header title="الأوراد" onBack={() => navigate('prayer')} />
            
            <div className="p-4">
                <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('groups')}
                        className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${activeTab === 'groups' ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        المجموعات
                    </button>
                    <button 
                        onClick={() => setActiveTab('individual')}
                        className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${activeTab === 'individual' ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        أوراد فردية
                    </button>
                </div>
            </div>

            <div className="flex-grow p-4 pt-0 overflow-y-auto space-y-6">
                {activeTab === 'groups' && (
                    <div>
                        {wirdGroups.length > 0 ? (
                            <div className="space-y-4">
                                {wirdGroups.map(group => {
                                    const groupAwrad = awrad.filter(w => group.wirdIds.includes(w.id));
                                    const isExpanded = expandedGroupIds.has(group.id);
                                    return (
                                        <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            <div 
                                                className="flex justify-between items-center p-4 cursor-pointer" 
                                                onClick={() => toggleGroup(group.id)}
                                                aria-expanded={isExpanded}
                                                aria-controls={`group-content-${group.id}`}
                                            >
                                                <div className="flex items-center">
                                                    <RectangleStackIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 ms-3">{group.name}</h3>
                                                </div>
                                                <div className="flex items-center">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); navigate('edit-wird-group', { group }); }} 
                                                        className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        aria-label={`تعديل مجموعة ${group.name}`}
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>
                                            <div 
                                                id={`group-content-${group.id}`}
                                                className={`transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                <div className="space-y-2 border-t dark:border-gray-700 px-4 pb-4 pt-3">
                                                    {groupAwrad.map(wird => (
                                                        <div key={wird.id} onClick={() => navigate('wird-detail', { wird })} className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full me-3">{getWirdIcon(wird)}</div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{wird.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{getWirdDescription(wird)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {groupAwrad.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center p-2">مجموعة فارغة</p>}
                                                    <button onClick={() => navigate('add-wirds-to-group', { group })} className="w-full text-center p-2 mt-2 text-green-600 dark:text-green-400 font-semibold rounded-md text-sm hover:bg-green-50 dark:hover:bg-green-900/50 flex items-center justify-center">
                                                        <PlusIcon className="w-4 h-4 me-2" />
                                                        إضافة ورد لهذه المجموعة
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                             <div className="text-center flex flex-col items-center justify-center pt-10 text-gray-500 dark:text-gray-400">
                                <RectangleStackIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4"/>
                                <p className="text-lg">لم تقم بإنشاء أي مجموعة.</p>
                                <p>قم بتنظيم أورادك في مجموعات لسهولة الوصول.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'individual' && (
                     <div>
                        {ungroupedAwrad.length > 0 ? (
                             <div className="space-y-3">
                                {ungroupedAwrad.map(wird => (
                                    <div key={wird.id} onClick={() => navigate('wird-detail', { wird })} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                         <div className="flex items-center">
                                            <div className="p-3 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">{getWirdIcon(wird)}</div>
                                            <div className="ms-4">
                                                <p className="font-semibold">{wird.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{getWirdDescription(wird)}</p>
                                            </div>
                                        </div>
                                        <span className="text-gray-400 font-bold text-xl">&gt;</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center flex flex-col items-center justify-center pt-10 text-gray-500 dark:text-gray-400">
                                <BookOpenIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4"/>
                                <p className="text-lg">لا يوجد أوراد فردية.</p>
                                <p>يمكنك إضافة ورد جديد، أو تفكيك مجموعة.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
             <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                {activeTab === 'groups' ? (
                    <button 
                      onClick={() => navigate('add-wird-group')}
                      className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center text-md shadow-lg hover:bg-blue-600 transition-colors">
                        <RectangleStackIcon className="w-5 h-5 me-2" />
                        إنشاء مجموعة
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => navigate('add-wird')}
                          className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center text-md shadow-lg hover:bg-green-600 transition-colors">
                            <PlusIcon className="w-5 h-5 me-2" />
                            إضافة ورد
                        </button>
                        <button 
                          onClick={() => navigate('add-wird-group')}
                          className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center text-md shadow-lg hover:bg-blue-600 transition-colors">
                            <RectangleStackIcon className="w-5 h-5 me-2" />
                            إنشاء مجموعة
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AwradListScreen;