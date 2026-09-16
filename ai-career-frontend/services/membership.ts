import  api  from "./api";

export interface MembershipStatus {
  subscription: {
    plan_name: string;
    status: string;
    price: number;
    start_date: string;
    end_date?: string | null;
  };

  usage: {
    resume_analysis_count: number;
    interview_count: number;
    question_count: number;
    voice_interview_count: number;
  };

  is_premium: boolean;
}

export async function getMembershipStatus() {
  const response =
    await api.get<MembershipStatus>(
      "/subscriptions/status"
    );

  return response.data;
}