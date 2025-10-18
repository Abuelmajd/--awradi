import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { Page, Wird, WirdGroup, WirdType, PRAYER_NAMES } from '../types';
import { BookOpenIcon, PersonLinkedIcon, PlusIcon } from '../components/Icons';

interface AddWirdsToGroupScreenProps {
  navigate: (page: Page, params?: any) => void;
  group: WirdGroup;
  allAwrad: Wird[];
  wirdGroups: WirdGroup[];
  onUpdateGroup: (group: WirdGroup) => void;
}

const AddWirdsToGroupScreen: React.FC<AddWirdsToGroupScreenProps> = ({ navigate, group, allAwrad, wirdGroups, onUpdateGroup }) => {
  const [selectedWirdIds, setSelectedWirdIds] = useState<Set<number>>(new Set());

  const ungroupedAwrad = useMemo(() => {
    const allGroupedIds = new Set(wirdGroups.flatMap(g => g.wirdIds));
    return allAwrad.filter(w => !allGroupedIds.has(w.id));
  }, [allAwrad, wirdGroups]);

  const handleToggleWird = (wirdId: number) => {
    setSelectedWirdIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wirdId)) {
        newSet.delete(wirdId);
      } else {
        newSet.add(wirdId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (selectedWirdIds.size === 0) {
      navigate('awrad');
      return;
    }
    onUpdateGroup({
      ...group,
      wirdIds: [...new Set([...group.wirdIds, ...selectedWirdIds])],
    });
    navigate('awrad');
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <Header title={`إضافة أوراد إلى "${group.name}"`} onBack={() => navigate('awrad')} />
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        <div className="bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm">
            <p>اختر من الأوراد الفردية الموجودة لإضافتها إلى هذه المجموعة، أو قم بإنشاء ورد جديد.</p>
        </div>
        
        <button 
          onClick={() => navigate('add-wird', { targetGroupId: group.id })}
          className="w-full bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-bold py-3 px-4 rounded-xl flex items-center justify-center text-md shadow-sm border dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/50 transition-colors">
            <PlusIcon className="w-5 h-5 me-2" />
            إنشاء ورد جديد وإضافته
        </button>

        <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">الأوراد الفردية المتاحة</h3>
            <div className="space-y-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm max-h-96 overflow-y-auto">
                {ungroupedAwrad.length > 0 ? ungroupedAwrad.map(wird => (
                    <div 
                        key={wird.id} 
                        onClick={() => handleToggleWird(wird.id)}
                        className={`p-3 flex items-center justify-between rounded-lg cursor-pointer transition-colors ${selectedWirdIds.has(wird.id) ? 'bg-green-100 dark:bg-green-500/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        <div className="flex items-center">
                            <div className="me-3 text-gray-500 dark:text-gray-400">
                                {wird.type === WirdType.DAILY ? <BookOpenIcon className="w-5 h-5"/> : <PersonLinkedIcon className="w-5 h-5"/>}
                            </div>
                            <div>
                                <p className="font-semibold">{wird.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {wird.type === WirdType.DAILY ? 'يومي' : `بعد ${PRAYER_NAMES[wird.linkedPrayer!]}`}
                                </p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all ${selectedWirdIds.has(wird.id) ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {selectedWirdIds.has(wird.id) && <span className="text-white">✓</span>}
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 p-4">لا يوجد أوراد فردية متاحة.</p>
                )}
            </div>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <button 
          onClick={handleSave}
          disabled={selectedWirdIds.size === 0}
          className="w-full bg-green-500 text-white font-bold py-4 px-4 rounded-xl text-lg shadow-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          إضافة الأوراد المحددة ({selectedWirdIds.size})
        </button>
      </div>
    </div>
  );
};
export default AddWirdsToGroupScreen;
