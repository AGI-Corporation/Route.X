import { createAction, Property } from "@activepieces/pieces-framework";
import { fhirAuth } from "../../";

export const scheduleAppointmentAction = createAction({
  auth: fhirAuth,
  name: "schedule_appointment",
  displayName: "Schedule Appointment",
  description: "Create a FHIR Appointment resource to schedule a clinical encounter for a patient.",
  aiDescription: "Book or schedule a patient appointment with a clinician via the FHIR server.",
  props: {
    patient_id: Property.ShortText({
      displayName: "Patient ID",
      description: "The FHIR ID of the patient to schedule the appointment for.",
      required: true,
      aiDescription: "The unique patient identifier from the FHIR server.",
    }),
    practitioner_id: Property.ShortText({
      displayName: "Practitioner ID",
      description: "The FHIR ID of the clinician or therapist.",
      required: true,
      aiDescription: "The unique identifier of the practitioner conducting the appointment.",
    }),
    start: Property.DateTime({
      displayName: "Start Time",
      description: "The ISO 8601 datetime for when the appointment begins.",
      required: true,
      aiDescription: "The scheduled start date and time for the appointment in ISO 8601 format.",
    }),
    duration_minutes: Property.Number({
      displayName: "Duration (minutes)",
      description: "The length of the appointment in minutes.",
      required: true,
      defaultValue: 60,
      aiDescription: "How long the appointment is expected to last, in minutes.",
    }),
    appointment_type: Property.StaticDropdown({
      displayName: "Appointment Type",
      required: true,
      defaultValue: "FOLLOWUP",
      options: {
        options: [
          { label: "Initial Assessment", value: "CHECKUP" },
          { label: "Follow-up", value: "FOLLOWUP" },
          { label: "Emergency", value: "EMERGENCY" },
          { label: "Therapy Session", value: "WALKIN" },
        ],
      },
      aiDescription: "The clinical type of the appointment being scheduled.",
    }),
    reason: Property.LongText({
      displayName: "Reason",
      description: "The clinical reason or chief complaint for this appointment.",
      required: false,
      aiDescription: "The reason the patient is being seen, used for clinical context.",
    }),
  },
  async run(context) {
    const { patient_id, practitioner_id, start, duration_minutes, appointment_type, reason } = context.propsValue;
    const proxyUrl = context.auth.props?.['proxy_url'];
    const appointmentId = `appt-${Date.now()}`;

    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + (duration_minutes ?? 60) * 60 * 1000);

    const appointment = {
      resourceType: "Appointment",
      id: appointmentId,
      status: "booked",
      appointmentType: {
        coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0276", code: appointment_type }],
      },
      reasonCode: reason ? [{ text: reason }] : [],
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      participant: [
        {
          actor: { reference: `Patient/${patient_id}` },
          status: "accepted",
        },
        {
          actor: { reference: `Practitioner/${practitioner_id}` },
          status: "accepted",
        },
      ],
    };

    return {
      resourceType: "Appointment",
      id: appointmentId,
      proxyUrl,
      resource: appointment,
    };
  },
});
