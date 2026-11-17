import { GetCampaignQuery } from "@/gql/graphql";

/** A campaign, as the campaign page loads it. */
export type CampaignData = GetCampaignQuery["campaigns"]["byId"];
