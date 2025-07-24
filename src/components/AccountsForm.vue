<script setup lang="ts">
import { ref } from "vue";
import Account from "./Account.vue";
import { mdiPlus, mdiHelpCircleOutline } from "@mdi/js";
import { useAccountsStore } from "@/stores/accountsStore";
import { storeToRefs } from "pinia";
import { v4 as uuidv4 } from "uuid";

const accountsStore = useAccountsStore();
const { accounts } = storeToRefs(accountsStore);
const { removeAccount, createAccount, updateAccount } = accountsStore;

const selectItems = ["LDAP", "Локальная"];
const hidePassFor = ["LDAP"];

const tempForms = ref<string[]>([]);

const addForm = (): void => {
  tempForms.value.push(uuidv4());
};

const removeForm = (id: string): void => {
  tempForms.value = tempForms.value.filter((accountId) => accountId !== id);
};

const showTooltip = ref(false);
</script>

<template>
  <div class="addAccount">
    <h1>Учетные записи</h1>
    <v-btn type="button" variant="outlined" @click="addForm">
      <v-icon size="x-large">
        <svg viewBox="0 0 24 24">
          <path :d="mdiPlus" />
        </svg>
      </v-icon>
    </v-btn>
  </div>

  <div class="tooltipContainer">
    <div v-if="showTooltip" class="tooltip">
      <v-icon size="large"
        ><svg viewBox="0 0 24 24">
          <path :d="mdiHelpCircleOutline" />
        </svg>
      </v-icon>
      <p>
        Для указания нескольких меток для одной пары логин/пароль используйте
        разделитель ;
      </p>
    </div>
  </div>

  <form>
    <v-container max-width="100vw">
      <v-row>
        <v-col cols="12" md="3">
          <h2>Метки</h2>
        </v-col>

        <v-col cols="12" md="2">
          <h2>Тип записи</h2>
        </v-col>

        <v-col cols="12" md="3">
          <h2>Логин</h2>
        </v-col>

        <v-col cols="12" md="3">
          <h2>Пароль</h2>
        </v-col>

        <v-col cols="12" md="1"></v-col>
      </v-row>

      <v-row
        v-if="accounts.length"
        v-for="account in accounts"
        :key="account.id"
      >
        <Account
          :account="account"
          :select-items="selectItems"
          :hide-pass-for="hidePassFor"
          :create-account="createAccount"
          :update-account="updateAccount"
          :remove-account="removeAccount"
          :remove-form="removeForm"
          @mark-focus="showTooltip = true"
          @mark-blur="showTooltip = false"
        />
      </v-row>

      <v-row v-if="tempForms.length" v-for="id in tempForms" :key="id">
        <Account
          :account="null"
          :select-items="selectItems"
          :hide-pass-for="hidePassFor"
          :create-account="createAccount"
          :update-account="updateAccount"
          :remove-account="removeAccount"
          :remove-form="removeForm"
          :new-id="id"
          @mark-focus="showTooltip = true"
          @mark-blur="showTooltip = false"
        />
      </v-row>
    </v-container>
  </form>
</template>

<style scoped>
.addAccount {
  display: flex;
  gap: 20px;
  padding: 16px;
}

.tooltipContainer {
  min-height: 36px;
}

.tooltip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-inline: 16px;
  padding: 4px;
  background-color: #d4e4f0;
  border-radius: 4px;
}

button {
  align-self: center;
}

button svg path {
  fill: #686868;
  cursor: pointer;
  transition: fill 0.5s ease, stroke 0.5s ease;
}

button:hover {
  border-color: #1867c0;
}

button:hover svg path {
  fill: #1867c0;
}
</style>
