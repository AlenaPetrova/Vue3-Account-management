export interface IAccount {
  id: string;
  mark: IMark[] | null;
  type: string;
  login: string;
  pass: string | null;
}

export interface IMark {
  text: string;
}
