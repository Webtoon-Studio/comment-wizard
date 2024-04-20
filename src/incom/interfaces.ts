type BodyFormatType = {
  type: string; // "PLAIN",
  version: string;
};

type SettingType = {
  reply: "ON" | "OFF";
  reaction: "ON" | "OFF";
  spoilerFilter: "ON" | "OFF";
};

type SectionGroupType = {
  totalCount: number;
  sections: any[];
};

type EmotionType = {
  emotionId: "like" | "dislike";
  count: number;
  reacted: boolean;
};

type CreatedByType = {
  publisherType: string; // "PAGE",
  id: string; // "wbi2v3",
  status: string; // "SERVICE",
  cuid: string; // "2f586b40-5a1c-11eb-9de0-246e96398d40",
  name: string; // "Gr33nEclipse",
  profileUrl: string; // "_wbi2v3",
  isCreator: boolean;
  isPageOwner: boolean;
  maskedUserId: string; // "2f58****",
  encUserId: string; // "",
  profileImage: object; // {},
  extraList: any[];
  restriction: {
    isWritePostRestricted: boolean;
    isBlindPostRestricted: boolean;
  };
};

export interface IEpicom {
  _type: "epicom"; // internal type

  serviceTicketId: "epicom";
  pageId: string; //`${'w'|'c'}_${number}_${number}}`;
  pageUrl: string;
  isOwner: boolean;
  isPinned: boolean;
  commentDepth: number;
  depth: number;
  creationType: string; // "BY_USER",
  status: string; // "SERVICE",
  createdAt: number; // 1712368102285,
  updatedAt: number; // 1712368102285,
  childPostCount: number;
  activeChildPostCount: number;
  pageOwnerChildPostCount: number;
  activePageOwnerChildPostCount: number;
  id: string; // "GW-epicom:0-w_1320_276-ee",
  rootId: string; // "GW-epicom:0-w_1320_276-ee"
  body: string;
  bodyFormat: BodyFormatType;
  settings: SettingType;
  sectionGroup: SectionGroupType;
  emotions: EmotionType[];
  extraList: any[];
  createdBy: CreatedByType;
}
