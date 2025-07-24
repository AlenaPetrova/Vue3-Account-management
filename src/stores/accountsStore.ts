import type { IAccount } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAccountsStore = defineStore(
  "accounts",
  () => {
    const accounts = ref<IAccount[]>([]);

    const createAccount = (obj: IAccount): void => {
      accounts.value.push(obj);
    };

    const updateAccount = (obj: IAccount): void => {
      const idx = accounts.value.findIndex((account) => account.id === obj.id);
      if (idx !== -1) {
        accounts.value[idx] = obj;
      }
    };

    const removeAccount = (id: string): void => {
      accounts.value = accounts.value.filter((account) => account.id !== id);
    };

    return { accounts, createAccount, updateAccount, removeAccount };
  },
  {
    persist: true,
  }
);
