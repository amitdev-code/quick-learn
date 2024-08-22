export type TUserType = {
  id?: number;
  code: string;
  name: string;
  description?: string;
};

export type TSkill = {
  name: string;
  team_id: number;
  id: number;
};

export type TUser = {
  uuid: string;
  display_name: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  active: boolean;
  user_type_id: number;
  user_type: TUserType;
  skill_id: number;
  skill: TSkill;
  team: {
    id: number;
    name: string;
  };
  last_login_timestamp: string;
  created_at: string;
  profile_image: string;
};

export type TUserMetadata = {
  user_types: TUserType[];
  skills: TSkill[];
};
