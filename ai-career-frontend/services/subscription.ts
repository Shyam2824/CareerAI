import  api  from "./api";

export interface Subscription {
  id: number;
  user_id: number;
  plan_name: string;
  price: number;
  status: string;
  start_date: string;
  end_date?: string | null;
}

export interface Usage {
  resume_analysis_count: number;
  interview_count: number;
  question_count: number;
  voice_interview_count: number;
}

export interface SubscriptionStatus {
  subscription: Subscription;
  usage: Usage;
  is_premium: boolean;
}

export async function getSubscriptionStatus() {
  const response =
    await api.get<SubscriptionStatus>(
      "/subscriptions/status"
    );

  return response.data;
}