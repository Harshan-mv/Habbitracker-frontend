import useFinanceStore from '../../store/useFinanceStore';

export default function deleteFinanceItemAndWaitForSave(deleteItem) {
  return new Promise((resolve, reject) => {
    let actionComplete = false;
    const unsubscribe = useFinanceStore.subscribe((state) => {
      if (!actionComplete || state._saveTimer !== null || state.isSaving) return;
      unsubscribe();
      resolve();
    });

    try {
      deleteItem();
      actionComplete = true;
      const { _saveTimer, isSaving } = useFinanceStore.getState();
      if (_saveTimer === null && !isSaving) {
        unsubscribe();
        resolve();
      }
    } catch (error) {
      unsubscribe();
      reject(error);
    }
  });
}
