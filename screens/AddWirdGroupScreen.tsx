import React, { useState } from 'react';
import Header from '../components/Header';
import { Page, Wird, WirdGroup, WirdType, PRAYER_NAMES } from '../types';
import { BookOpenIcon, PersonLinkedIcon } from '../components/Icons';

interface AddWirdGroupScreenProps {
  navigate: (page: Page) => void;
  allAwrad: Wird[];
  onAddGroup: (group: Omit<WirdGroup, 'id'>) => void;
}

const AddWirdGroupScreen: React.FC<AddWirdGroupScreenProps> = ({ navigate, allAwrad, onAddGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedWirdIds, setSelectedWirdIds] = useState<Set<number>>(new Set());

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
    if (!groupName.trim()) {
      // Maybe show an alert
      return;
    }
    onAddGroup({
      name: groupName.trim(),
      wirdIds: Array.from(selectedWirdIds),
    });
    navigate('awrad');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <Header title="إنشاء مجموعة جديدة" onBack={() => navigate('awrad')} />
      <div className="flex-grow p-4 space-y-6 overflow-y-auto">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">اسم المجموعة</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="مثال: أذكار الصباح والمساء"
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">اختر الأوراد</h3>
            <div className="space-y-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm max-h-96 overflow-y-auto">
                {allAwrad.length > 0 ? allAwrad.map(wird => (
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
                    <p className="text-center text-gray-500 dark:text-gray-400 p-4">لا يوجد أوراد لإضافتها. قم بإنشاء ورد أولاً.</p>
                )}
            </div>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <button 
          onClick={handleSave}
          disabled={!groupName.trim()}
          className="w-full bg-green-500 text-white font-bold py-4 px-4 rounded-xl text-lg shadow-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          حفظ المجموعة
        </button>
      </div>
    </div>
  );
};

export default AddWirdGroupScreen;