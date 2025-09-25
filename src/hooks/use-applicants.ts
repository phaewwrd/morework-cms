import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicantsApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import { PrismaClient } from "@prisma/client";

// Applicant queries
export function useApplicants(filters?: any) {
  return useQuery({
    queryKey: queryKeys.applicants.list(filters || {}),
    queryFn: () => applicantsApi.getAll(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes - applicant data changes frequently
  })
}

export function useApplicant(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.applicants.detail(id),
    queryFn: () => applicantsApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Applicant mutations
export function useCreateApplicant() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: applicantsApi.create,
    onSuccess: (data) => {
      // Invalidate applicants list
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() })
      
      // Optimistically add to cache
      if (data.data) {
        queryClient.setQueryData(
          queryKeys.applicants.detail(data.data.id),
          data
        )
      }
      
      toast({
        title: 'Success',
        description: 'Applicant created successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create applicant',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateApplicant() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      applicantsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific applicant in cache
      queryClient.setQueryData(
        queryKeys.applicants.detail(variables.id),
        data
      )
      
      // Invalidate applicants list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() })
      
      // Also invalidate company applicants if this affects company view
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.byCompany(0) })
      
      toast({
        title: 'Success',
        description: 'Applicant updated successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update applicant',
        variant: 'destructive',
      })
    },
  })
}

const toGenderEnum = (gender: string | null | undefined): string => {
  const upperGender = (gender || 'OTHER').toUpperCase();
  if (upperGender === 'MALE' || upperGender === 'FEMALE' || upperGender === 'OTHER') {
    return upperGender;
  }
  // Default to 'OTHER' if the provided gender is not a valid enum value
  return 'OTHER';
};

// Helper function to safely parse date strings or objects
const toSafeDate = (date: string | Date | null | undefined, defaultDate: Date): Date => {
  if (!date) {
    return defaultDate;
  }
  const parsedDate = new Date(date);
  // Return the default if the provided date is invalid
  if (isNaN(parsedDate.getTime())) {
    return defaultDate;
  }
  return parsedDate;
};


export const upsertApplicantData = async (prisma: PrismaClient, applicantId: number | null, data: any) => {
  const {
    provider,
    session_id,
    first_name,
    last_name,
    gender,
    age,
    phone,
    birth_date,
    passed_experience,
    current_workplace,
    current_address,
    ready_start_date,
    preferred_workplace,
    preferred_job_type,
    educations,
    trainings,
    positions,
    workExperiences,
    StartWorkingDate,
    prefferedLocation,
    email,
  } = data;

  let applicant;

  const applicantData: any = {};
  if (first_name) applicantData.firstName = first_name;
  if (last_name) applicantData.lastName = last_name;
  if (gender) applicantData.gender = gender.toUpperCase();
  if (phone) applicantData.phone = phone;
  if (email) applicantData.email = email;
  if (age) applicantData.age = Number(age);
  if (birth_date) {
    applicantData.birthDate = new Date(birth_date);
    applicantData.age = new Date().getFullYear() - new Date(birth_date).getFullYear();
  }
  if (StartWorkingDate) {
    applicantData.startWorkingDate = new Date(StartWorkingDate);
  } else if (ready_start_date) {
    applicantData.startWorkingDate = new Date(ready_start_date);
  }
  if (prefferedLocation) {
    applicantData.prefferedLocation = prefferedLocation;
  } else if (preferred_workplace) {
    applicantData.prefferedLocation = preferred_workplace;
  }

  if (applicantId) {
    applicant = await prisma.applicant.update({
      where: { id: applicantId },
      data: applicantData,
    });
  } else {
    applicant = await prisma.applicant.create({
      data: {
        ...applicantData,
        email: applicantData.email || `tmp${Date.now()}@mail.com`,
        age: applicantData.age || 0,
        gender: toGenderEnum(applicantData.gender),
        birthDate: toSafeDate(applicantData.birthDate, new Date()),
        phone: applicantData.phone || "",
        startWorkingDate: toSafeDate(applicantData.startWorkingDate, new Date()),
        prefferedLocation: applicantData.prefferedLocation || ""
      },
    });

    if (provider && session_id) {
        await prisma.socialMedia.create({
            data: {
            provider: provider,
            sessionId: session_id,
            applicantId: applicant.id,
            },
        });
    }
  }

  if (passed_experience) {
    const workExperience = await prisma.applicantWorkExperience.findFirst({
      where: {
        applicantId: applicant.id,
        currentPosition: false,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    if (workExperience) {
      await prisma.applicantWorkExperience.update({
        where: {
          id: workExperience.id,
        },
        data: {
          description: passed_experience,
        },
      });
    } else {
      await prisma.applicantWorkExperience.create({
        data: {
          applicantId: applicant.id,
          description: passed_experience,
          company: "-",
          position: "-",
          startDate: new Date('1970-01-01'),
        },
      });
    }
  }

  if (current_workplace) {
    const workExperience = await prisma.applicantWorkExperience.findFirst({
      where: {
        applicantId: applicant.id,
        currentPosition: true,
      },
    });

    if (workExperience) {
      await prisma.applicantWorkExperience.update({
        where: {
          id: workExperience.id,
        },
        data: {
          description: current_workplace,
        },
      });
    } else {
      await prisma.applicantWorkExperience.create({
        data: {
          applicantId: applicant.id,
          description: current_workplace,
          company: "-",
          position: "-",
          startDate: new Date('1970-01-01'),
          currentPosition: true,
        },
      });
    }
  }

  if (workExperiences && Array.isArray(workExperiences)) {
    const existingWorkExperiences = await prisma.applicantWorkExperience.findMany({
      where: { applicantId: applicant.id },
    });
    const existingWorkExperienceIds = existingWorkExperiences.map((w) => w.id);
    const incomingWorkExperienceIds = new Set(workExperiences.map((w) => w.id).filter(id => id));

    const workExperiencesToCreate = workExperiences.filter((w) => !w.id);
    const workExperiencesToUpdate = workExperiences.filter((w) => w.id && existingWorkExperienceIds.includes(w.id));
    const workExperienceIdsToDelete = existingWorkExperienceIds.filter((id) => !incomingWorkExperienceIds.has(id));

    const operations: any[] = [];

    // Deletions
    if (workExperienceIdsToDelete.length > 0) {
      operations.push(
        prisma.applicantWorkExperience.deleteMany({
          where: {
            id: {
              in: workExperienceIdsToDelete,
            },
          },
        })
      );
    }

    // Creations
    if (workExperiencesToCreate.length > 0) {
      operations.push(
        ...workExperiencesToCreate.map((work) =>
          prisma.applicantWorkExperience.create({
            data: {
              applicantId: applicant.id,
              company: work.company,
              position: work.position,
              description: work.description,
              currentPosition: work.currentPosition,
              startDate: new Date(), // Or get from input
            },
          })
        )
      );
    }

    // Updates
    if (workExperiencesToUpdate.length > 0) {
      operations.push(
        ...workExperiencesToUpdate.map((work) =>
          prisma.applicantWorkExperience.update({
            where: { id: work.id },
            data: {
              company: work.company,
              position: work.position,
              description: work.description,
              currentPosition: work.currentPosition,
            },
          })
        )
      );
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
  }

  if (current_address) {
      for (const address of current_address) {
          if(address.district_id) {
              const existingAddress = await prisma.applicantAddress.findFirst({
                  where: {
                      applicantId: applicant.id,
                  }
              });

              if (existingAddress) {
                  await prisma.applicantAddress.update({
                      where: {
                          id: existingAddress.id,
                      },
                      data: {
                          districtId: parseInt(address.district_id),
                      },
                  });
              } else {
                  await prisma.applicantAddress.create({
                      data: {
                          applicantId: applicant.id,
                          districtId: parseInt(address.district_id),
                          address: '-',
                      },
                  });
              }
          }
      }
  }

  if (preferred_job_type) {
    // Find the JobType records based on the provided titles
    const jobTypes = await prisma.jobType.findMany({
      where: {
        id: {
          in: preferred_job_type,
        },
      },
    });
    const incomingJobTypeIds = new Set(jobTypes.map(jt => jt.id));

    const existingApplicantsJobTypes = await prisma.applicantsJobType.findMany({
        where: { applicantId: applicant.id },
    });
    const existingJobTypeIds = existingApplicantsJobTypes.map(ajt => ajt.jobTypeId);

    const jobTypeIdsToDelete = existingJobTypeIds.filter(id => !incomingJobTypeIds.has(id));
    const jobTypesToCreate = jobTypes.filter(jt => !existingJobTypeIds.includes(jt.id));

    const operations: any[] = [];

    if (jobTypeIdsToDelete.length > 0) {
        operations.push(
            prisma.applicantsJobType.deleteMany({
                where: {
                    applicantId: applicant.id,
                    jobTypeId: {
                        in: jobTypeIdsToDelete,
                    },
                },
            })
        );
    }

    if (jobTypesToCreate.length > 0) {
        operations.push(
            prisma.applicantsJobType.createMany({
                data: jobTypesToCreate.map(jobType => ({
                    applicantId: applicant.id,
                    jobTypeId: jobType.id,
                })),
            })
        );
    }

    if (operations.length > 0) {
        await prisma.$transaction(operations);
    }
  }

  if (educations && Array.isArray(educations)) {
    const existingEducations = await prisma.applicantEducation.findMany({
      where: { applicantId: applicant.id },
    });
    const existingEducationIds = existingEducations.map((e) => e.id);
    const incomingEducationIds = new Set(educations.map((e) => e.id).filter(id => id));

    const educationsToCreate = educations.filter((e) => !e.id);
    const educationsToUpdate = educations.filter((e) => e.id && existingEducationIds.includes(e.id));
    const educationIdsToDelete = existingEducationIds.filter((id) => !incomingEducationIds.has(id));

    const operations: any[] = [];

    // Deletions
    if (educationIdsToDelete.length > 0) {
      operations.push(
        prisma.applicantEducation.deleteMany({
          where: {
            id: {
              in: educationIdsToDelete,
            },
          },
        })
      );
    }

    // Creations
    if (educationsToCreate.length > 0) {
      operations.push(
        ...educationsToCreate.map((edu) =>
          prisma.applicantEducation.create({
            data: {
              applicantId: applicant.id,
              educationlevelId: edu.educationlevelId,
              institution: edu.institution,
              field: edu.field,
              graduationYear: edu.graduationYear,
              gpa: edu.gpa,
            },
          })
        )
      );
    }

    // Updates
    if (educationsToUpdate.length > 0) {
      operations.push(
        ...educationsToUpdate.map((edu) =>
          prisma.applicantEducation.update({
            where: { id: edu.id },
            data: {
              educationlevelId: edu.educationlevelId,
              institution: edu.institution,
              field: edu.field,
              graduationYear: edu.graduationYear,
              gpa: edu.gpa,
            },
          })
        )
      );
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
  }

  if (trainings && Array.isArray(trainings)) {
    const existingTrainings = await prisma.applicantTraining.findMany({
      where: { applicantId: applicant.id },
    });
    const existingTrainingIds = existingTrainings.map((t) => t.id);
    const incomingTrainingIds = new Set(trainings.map((t) => t.id).filter(id => id));

    const trainingsToCreate = trainings.filter((t) => !t.id);
    const trainingsToUpdate = trainings.filter((t) => t.id && existingTrainingIds.includes(t.id));
    const trainingIdsToDelete = existingTrainingIds.filter((id) => !incomingTrainingIds.has(id));

    const operations: any[] = [];

    // Deletions
    if (trainingIdsToDelete.length > 0) {
      operations.push(
        prisma.applicantTraining.deleteMany({
          where: {
            id: {
              in: trainingIdsToDelete,
            },
          },
        })
      );
    }

    // Creations
    if (trainingsToCreate.length > 0) {
      operations.push(
        ...trainingsToCreate.map((train) =>
          prisma.applicantTraining.create({
            data: {
              applicantId: applicant.id,
              title: train.title,
              description: train.description,
              trainingYear: train.trainingYear,
            },
          })
        )
      );
    }

    // Updates
    if (trainingsToUpdate.length > 0) {
      operations.push(
        ...trainingsToUpdate.map((train) =>
          prisma.applicantTraining.update({
            where: { id: train.id },
            data: {
              title: train.title,
              description: train.description,
              trainingYear: train.trainingYear,
            },
          })
        )
      );
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
  }

  if (positions && Array.isArray(positions)) {
    const existingPositions = await prisma.applicantPosition.findMany({
      where: { applicantId: applicant.id },
    });
    const existingPositionIds = existingPositions.map((p) => p.id);
    const incomingPositionIds = new Set(positions.map((p) => p.id).filter(id => id));

    const positionsToCreate = positions.filter((p) => !p.id);
    const positionsToUpdate = positions.filter((p) => p.id && existingPositionIds.includes(p.id));
    const positionIdsToDelete = existingPositionIds.filter((id) => !incomingPositionIds.has(id));

    const operations: any[] = [];

    // Deletions
    if (positionIdsToDelete.length > 0) {
      operations.push(
        prisma.applicantPosition.deleteMany({
          where: {
            id: {
              in: positionIdsToDelete,
            },
          },
        })
      );
    }

    // Creations
    if (positionsToCreate.length > 0) {
      operations.push(
        ...positionsToCreate.map((pos) =>
          prisma.applicantPosition.create({
            data: {
              applicantId: applicant.id,
              positionId: pos.positionId,
              status: pos.status,
            },
          })
        )
      );
    }

    // Updates
    if (positionsToUpdate.length > 0) {
      operations.push(
        ...positionsToUpdate.map((pos) =>
          prisma.applicantPosition.update({
            where: { id: pos.id },
            data: {
              positionId: pos.positionId,
              status: pos.status,
            },
          })
        )
      );
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
  }

  return applicant;
};



export function useDeleteApplicant() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: applicantsApi.delete,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.applicants.detail(id) })
      
      // Invalidate applicants list
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() })
      
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.byCompany(0) })
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.byApplicant(id) })
      
      toast({
        title: 'Success',
        description: 'Applicant deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete applicant',
        variant: 'destructive',
      })
    },
  })
}
