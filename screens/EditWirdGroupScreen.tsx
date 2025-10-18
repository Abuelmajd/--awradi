import React, { useState } from 'react';
import Header from '../components/Header';
import { Page, Wird, WirdGroup, WirdType, PRAYER_NAMES } from '../types';
import { BookOpenIcon, PersonLinkedIcon } from '../components/Icons';

interface EditWirdGroupScreenProps {
  navigate: (page: Page) => void;
  group: WirdGroup;
  allAwrad: Wird[];
  onUpdateGroup: (group: WirdGroup) => void;
  onDeleteGroup: (groupId: number) => void;
}

const EditWirdGroupScreen: React.FC<EditWirdGroupScreenProps> = ({ navigate, group, allAwrad, onUpdateGroup, onDeleteGroup }) => {
  const [groupName, setGroupName] = useState(group.name);
  const [selectedWirdIds, setSelectedWirdIds] = useState<Set<number>>(new Set(group.wirdIds));
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

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
      return;
    }
    onUpdateGroup({
      ...group,
      name: groupName.trim(),
      wirdIds: Array.from(selectedWirdIds),
    });
    navigate('awrad');
  };
  
  const handleConfirmDelete = () => {
    onDeleteGroup(group.id);
    setIsDeleteConfirmVisible(false);
    navigate('awrad');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <Header title="تعديل المجموعة" onBack={() => navigate('awrad')} />
      <div className="flex-grow p-4 space-y-6 overflow-y-auto">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">اسم المجموعة</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
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
                    <p className="text-center text-gray-500 dark:text-gray-400 p-4">لا يوجد أوراد لإضافتها.</p>
                )}
            </div>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 space-y-3">
        <button 
          onClick={handleSave}
          disabled={!groupName.trim()}
          className="w-full bg-green-500 text-white font-bold py-4 px-4 rounded-xl text-lg shadow-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          حفظ التعديلات
        </button>
        <button 
          onClick={() => setIsDeleteConfirmVisible(true)}
          className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-xl text-lg shadow-lg hover:bg-red-600 transition-colors"
        >
          حذف المجموعة
        </button>
      </div>

      {isDeleteConfirmVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-xl animate-pop-in text-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">تأكيد الحذف</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              هل أنت متأكد من حذف مجموعة "{group.name}"؟
              <br />
              <span className="text-sm text-gray-500 dark:text-gray-400">لن يتم حذف الأوراد الموجودة بداخلها.</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsDeleteConfirmVisible(false)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                لا
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                نعم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditWirdGroupScreen;