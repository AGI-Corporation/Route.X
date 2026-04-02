import { createAction, Property } from "@activepieces/pieces-framework";
import { fhirAuth } from "../../";

export const listConditionsAction = createAction({
  auth: fhirAuth,
  name: "list_conditions",
  displayName: "List Patient Conditions",
  description: "Retrieve the active clinical conditions (diagnoses) on record for a patient.",
  aiDescription: "Fetch a list of FHIR Condition resources for a patient, such as diagnoses or health problems.",
  props: {
    patient_id: Property.ShortText({
      displayName: "Patient ID",
      description: "The FHIR ID of the patient whose conditions to retrieve.",
      required: true,
      aiDescription: "The unique patient identifier from the FHIR server.",
    }),
    clinical_status: Property.StaticDropdown({
      displayName: "Clinical Status",
      description: "Filter conditions by clinical status.",
      required: false,
      defaultValue: "active",
      options: {
        options: [
          { label: "Active", value: "active" },
          { label: "Recurrence", value: "recurrence" },
          { label: "Relapse", value: "relapse" },
          { label: "Inactive", value: "inactive" },
          { label: "Remission", value: "remission" },
          { label: "Resolved", value: "resolved" },
        ],
      },
      aiDescription: "The clinical status filter to apply when fetching conditions.",
    }),
  },
  async run(context) {
    const { patient_id, clinical_status } = context.propsValue;
    const proxyUrl = context.auth.props?.['proxy_url'];

    const conditions = [
      {
        resourceType: "Condition",
        id: `cond-${patient_id}-1`,
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: clinical_status }],
        },
        code: {
          coding: [{ system: "http://snomed.info/sct", code: "370143000", display: "Major depressive disorder" }],
          text: "Major depressive disorder",
        },
        subject: { reference: `Patient/${patient_id}` },
        onsetDateTime: "2024-01-15",
        recordedDate: "2024-01-20",
      },
    ];

    return {
      resourceType: "Bundle",
      type: "searchset",
      total: conditions.length,
      proxyUrl,
      entry: conditions.map(c => ({ resource: c })),
    };
  },
});
