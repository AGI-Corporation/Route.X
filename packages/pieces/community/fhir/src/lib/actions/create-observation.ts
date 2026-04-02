import { createAction, Property } from "@activepieces/pieces-framework";
import { fhirAuth } from "../../";

export const createObservationAction = createAction({
  auth: fhirAuth,
  name: "create_observation",
  displayName: "Create Observation",
  description: "Record a clinical observation (e.g., vital signs, lab results) for a patient via the FHIR server.",
  aiDescription: "Record a FHIR Observation resource such as blood pressure, heart rate, or mood score for a specific patient.",
  props: {
    patient_id: Property.ShortText({
      displayName: "Patient ID",
      description: "The FHIR ID of the patient this observation belongs to.",
      required: true,
      aiDescription: "The unique patient identifier from the FHIR server.",
    }),
    code: Property.ShortText({
      displayName: "LOINC Code",
      description: "The LOINC code identifying the type of observation (e.g., '8867-4' for heart rate).",
      required: true,
      aiDescription: "Standard LOINC code for the clinical measurement being recorded.",
      examples: ["8867-4", "55284-4", "72166-2"],
    }),
    display: Property.ShortText({
      displayName: "Display Name",
      description: "Human-readable name for the observation (e.g., 'Heart rate').",
      required: true,
      aiDescription: "A short label describing what is being measured.",
    }),
    value: Property.Number({
      displayName: "Value",
      description: "The numeric measurement value.",
      required: true,
      aiDescription: "The measured clinical value as a number.",
    }),
    unit: Property.ShortText({
      displayName: "Unit",
      description: "The unit of measurement (e.g., 'bpm', 'mmHg', '%').",
      required: true,
      aiDescription: "Unit of measure for the observation value.",
      examples: ["bpm", "mmHg", "%", "kg", "°F"],
    }),
    status: Property.StaticDropdown({
      displayName: "Status",
      required: true,
      defaultValue: "final",
      options: {
        options: [
          { label: "Final", value: "final" },
          { label: "Preliminary", value: "preliminary" },
          { label: "Amended", value: "amended" },
          { label: "Registered", value: "registered" },
        ],
      },
      aiDescription: "The clinical status of the observation result.",
    }),
  },
  async run(context) {
    const { patient_id, code, display, value, unit, status } = context.propsValue;
    const proxyUrl = context.auth.props?.['proxy_url'];
    const observationId = `obs-${Date.now()}`;

    const observation = {
      resourceType: "Observation",
      id: observationId,
      status,
      code: {
        coding: [{ system: "http://loinc.org", code, display }],
        text: display,
      },
      subject: { reference: `Patient/${patient_id}` },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: { value, unit, system: "http://unitsofmeasure.org", code: unit },
    };

    return {
      resourceType: "Observation",
      id: observationId,
      proxyUrl,
      resource: observation,
    };
  },
});
