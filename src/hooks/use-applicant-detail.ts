import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface ApplicantAddress {
  id: number;
  address: string;
  districtId: number;
  district: {
    id: number;
    title: string;
    province: {
      id: number;
      title: string;
    };
  };
}

interface ApplicantEducation {
  id: number;
  institution: string;
  field: string;
  graduationYear: number;
  gpa: number;
  educationLevel: {
    id: number;
    title: string;
    code: string;
    rank: number;
  };
}

interface ApplicantWorkExperience {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
  currentPosition: boolean;
}

interface ApplicantTraining {
  id: number;
  title: string;
  description: string;
  trainingYear: number;
}

interface ApplicantDocument {
  id: number;
  documentType: string;
  description: string;
  filePath: string;
}

interface ApplicantPosition {
  id: number;
  status: string;
  appliedAt: string;
  position: {
    id: number;
    title: string;
    jobDescription: string;
    company: {
      id: number;
      title: string;
      city: string;
      country: string;
    };
  };
}

interface SocialMedia {
  id: number;
  provider: string;
  sessionId: string;
}

interface JobType {
  id: number;
  applicantId: number;
  jobTypeId: number;
  jobType: {
    id: number;
    title: string;
  };
}

export interface ApplicantDetail {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  age: number;
  birthDate: string;
  phone: string;
  email: string;
  start_working_date: string;
  preffered_location: string;
  addresses: ApplicantAddress[];
  educations: ApplicantEducation[];
  workExperiences: ApplicantWorkExperience[];
  trainings: ApplicantTraining[];
  documents: ApplicantDocument[];
  positions: ApplicantPosition[];
  socialMedia: SocialMedia[];
  jobTypes: JobType[];
}

interface UpdateApplicantData {
  first_name?: string;
  last_name?: string;
  gender?: string;
  age?: number;
  birthDate?: string;
  phone?: string;
  email?: string;
  start_working_date?: string;
  preffered_location?: string;
}

async function fetchApplicantDetail(id: string): Promise<ApplicantDetail> {
  const response = await fetch(`/api/applicants/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch applicant");
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

async function updateApplicant(
  id: string,
  data: UpdateApplicantData
): Promise<ApplicantDetail> {
  const response = await fetch(`/api/applicants/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update applicant");
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
}

export function useApplicantDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.applicants.detail(parseInt(id)),
    queryFn: () => fetchApplicantDetail(id),
    enabled: !!id,
  });
}

export function useUpdateApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicantData }) =>
      updateApplicant(id, data),
    onSuccess: (updatedApplicant) => {
      // Update the cached applicant detail
      queryClient.setQueryData(
        queryKeys.applicants.detail(updatedApplicant.id),
        updatedApplicant
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.all });
    },
  });
}
