<script setup lang="ts">
import { useField, useForm, type FieldContext } from "vee-validate";
import { mdiDelete } from "@mdi/js";
import type { IAccount } from "@/types";
import { markArrayToStr, markStrToArray } from "@/composables/useMark";
import { ref, watch, defineEmits } from "vue";
import { mdiEye, mdiEyeOff } from "@mdi/js";

const {
  account,
  selectItems,
  hidePassFor,
  newId,
  createAccount,
  removeAccount,
  updateAccount,
  removeForm,
} = defineProps<{
  account: IAccount | null;
  selectItems: string[];
  hidePassFor: string[];
  newId?: string;
  createAccount: (obj: IAccount) => void;
  removeAccount: (id: string) => void;
  updateAccount: (obj: IAccount) => void;
  removeForm: (id: string) => void;
}>();

const emit = defineEmits<{
  (e: "mark-focus"): void;
  (e: "mark-blur"): void;
}>();

const {} = useForm({
  validationSchema: {
    mark(value: string | null): boolean | string {
      if (!value || value.length <= maxSymbols) return true;
      return `The mark needs no more than ${maxSymbols} characters.`;
    },

    type(value: string): boolean | string {
      if (value) return true;
      return "Select type.";
    },

    login(value: string): boolean | string {
      if (value && value.length <= maxSymbols * 2) return true;
      if (!value) return "Enter login";
      return `Login needs no more than ${maxSymbols * 2} characters.`;
    },

    pass(value: string): boolean | string {
      if (value && value.length <= maxSymbols * 2) return true;
      if (!value) return "Enter password";
      return `Password needs no more than ${maxSymbols * 2} characters.`;
    },
  },
});

const mark = useField<string>("mark", undefined, {
  initialValue: account?.mark ? markArrayToStr(account.mark) : undefined,
});
const type = useField<string>("type", undefined, {
  initialValue: account?.type,
});
const login = useField<string>("login", undefined, {
  initialValue: account?.login,
});
const pass = useField<string | null>("pass", undefined, {
  initialValue: account?.pass,
});

const isValidData = ref({
  mark: false,
  type: false,
  login: false,
  pass: false,
});

const validate = async (
  context: FieldContext,
  key: keyof typeof isValidData.value
) => {
  const result = await context.validate();
  isValidData.value[key] = result.valid;
};

const showPassword = ref(false);

let blurTimeout: ReturnType<typeof setTimeout> | null = null;
const blurAfterDelay = (event: Event): void => {
  if (blurTimeout) clearTimeout(blurTimeout);
  blurTimeout = setTimeout(() => {
    (event.target as HTMLElement).blur();
  }, 1000);
};
const selectRef = ref();
const blurSelectAfterDelay = (): void => {
  setTimeout(() => {
    const input = selectRef.value?.$el?.querySelector("input");
    if (input) input.blur();
  }, 1000);
};

const maxSymbols = 50;

const accountId: string = account?.id ?? (newId as string);

const tryCreateAccount = () => {
  const newAccount: IAccount = {
    id: newId as string,
    mark: markStrToArray(mark.value.value),
    type: type.value.value,
    login: login.value.value,
    pass: hidePassFor.includes(type.value.value) ? null : pass.value.value,
  };
  createAccount(newAccount);
};

watch(
  isValidData,
  (val) => {
    if (newId) {
      if (
        hidePassFor.includes(type.value.value) &&
        val.mark &&
        val.type &&
        val.login
      ) {
        tryCreateAccount();
        removeForm(newId);
      }
      if (val.mark && val.type && val.login && val.pass) {
        tryCreateAccount();
        removeForm(newId);
      }
    }
    if (account?.id) {
      if (val.mark)
        updateAccount({ ...account, mark: markStrToArray(mark.value.value) });

      if (val.login) updateAccount({ ...account, login: login.value.value });

      if (val.pass) updateAccount({ ...account, pass: pass.value.value });

      if (val.type) {
        if (hidePassFor.includes(type.value.value))
          updateAccount({ ...account, type: type.value.value, pass: null });
        else {
          pass.validate();
          if (val.pass)
            updateAccount({
              ...account,
              type: type.value.value,
              pass: pass.value.value,
            });
        }
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <v-col cols="12" md="3">
    <v-text-field
      v-model="mark.value.value"
      :counter="maxSymbols"
      :error-messages="mark.errorMessage.value"
      placeholder="Введите название метки"
      color="primary"
      variant="outlined"
      @input="blurAfterDelay"
      @keydown.enter="blurAfterDelay"
      @focus="emit('mark-focus')"
      @blur="
        () => {
          validate(mark, 'mark');
          emit('mark-blur');
        }
      "
    ></v-text-field>
  </v-col>

  <v-col cols="12" md="2">
    <v-select
      ref="selectRef"
      v-model="type.value.value"
      :error-messages="type.errorMessage.value"
      :items="selectItems"
      placeholder="Выберите тип"
      color="primary"
      variant="outlined"
      @update:model-value="
        () => {
          blurSelectAfterDelay();
          validate(type, 'type');
        }
      "
      @blur="validate(type, 'type')"
    ></v-select>
  </v-col>

  <v-col cols="12" :md="hidePassFor.includes(type.value.value) ? 6 : 3">
    <v-text-field
      v-model="login.value.value"
      :counter="maxSymbols * 2"
      :error-messages="login.errorMessage.value"
      placeholder="Введите логин"
      color="primary"
      variant="outlined"
      @input="blurAfterDelay"
      @keydown.enter="blurAfterDelay"
      @blur="validate(login, 'login')"
    ></v-text-field>
  </v-col>

  <template v-if="!hidePassFor.includes(type.value.value)">
    <v-col cols="12" md="3">
      <v-text-field
        v-model="pass.value.value"
        :counter="maxSymbols * 2"
        :error-messages="pass.errorMessage.value"
        placeholder="Введите пароль"
        color="primary"
        variant="outlined"
        :type="showPassword ? 'text' : 'password'"
        @input="blurAfterDelay"
        @keydown.enter="blurAfterDelay"
        @blur="validate(pass, 'pass')"
        ><template #append-inner>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            style="cursor: pointer"
            @click="showPassword = !showPassword"
          >
            <path :d="showPassword ? mdiEyeOff : mdiEye" />
          </svg>
        </template>
      </v-text-field>
    </v-col>
  </template>

  <v-col cols="12" md="1" class="d-flex justify-center mt-3">
    <v-icon
      size="x-large"
      @click="
        () => {
          removeAccount(accountId);
          removeForm(accountId);
        }
      "
    >
      <svg viewBox="0 0 24 24">
        <path :d="mdiDelete" />
      </svg> </v-icon
  ></v-col>
</template>

<style scoped>
svg path {
  fill: #686868;
  cursor: pointer;
  transition: fill 0.5s ease, stroke 0.5s ease;

  &:hover {
    fill: #1867c0;
  }
}
</style>
