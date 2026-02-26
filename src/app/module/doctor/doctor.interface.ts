import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorSpecialtyPayload {
  specialtyId: string;
  shouldDelete?: boolean;
}
export interface IUpdateDoctorPayload {
  doctor: {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
    gender?: Gender;
    registrationNumber?: string;
    qualification?: string;
    designation?: string;
    address?: string;
    experience?: number;
    appointmentFee?: number;
    currentWorkingPlace?: string;
  };
  specialties?: IUpdateDoctorSpecialtyPayload[];
}
