
import { createAction, Property } from "@activepieces/pieces-framework";
import { fhirAuth } from "../../";

export const getPatientAction = createAction({
  auth: fhirAuth,
  name: "get_patient",
  displayName: "Get Patient Resource",
  description: "Fetch a Patient resource by ID from the FHIR server.",
  props: {
    patient_id: Property.ShortText({
      displayName: "Patient ID",
      description: "The unique ID of the patient.",
      required: true,
    })
  },
  async run(context) {
    const { patient_id } = context.propsValue;
    const auth = context.auth as { access_token: string; props?: Record<string, unknown> };
    const proxyUrl = auth.props?.['proxy_url'] as string | undefined;

    if (!proxyUrl) {
      throw new Error('Proxy Smart URL is not configured. Please update your FHIR connection.');
    }

    const url = `${proxyUrl.replace(/\/$/, '')}/fhir/R4/Patient/${encodeURIComponent(patient_id)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${auth.access_token}`,
        'Accept': 'application/fhir+json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`FHIR request failed [${response.status}]: ${errorText}`);
    }

    return response.json();
  },
});
