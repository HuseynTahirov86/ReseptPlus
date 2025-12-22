import type { ClientCompany, SupportingOrganization } from "@/lib/types";
import { db } from "@/firebase/server-init";
import { PartnersClientPage } from "./client-page";

async function getPartners() {
    try {
        const supportingOrgsSnapshot = await db.collection("supportingOrganizations").get();
        const supportingOrganizations = supportingOrgsSnapshot.docs.map(doc => doc.data() as SupportingOrganization);

        const clientCompaniesSnapshot = await db.collection("clientCompanies").get();
        const clientCompanies = clientCompaniesSnapshot.docs.map(doc => doc.data() as ClientCompany);
        
        return { supportingOrganizations, clientCompanies };

    } catch (error) {
        console.error("Error fetching partners in Server Component: ", error);
        // Return empty arrays on error to prevent crashing the page.
        return { supportingOrganizations: [], clientCompanies: [] };
    }
}

export default async function AdminPartnersPage() {
    const { supportingOrganizations, clientCompanies } = await getPartners();

    return (
        <PartnersClientPage 
            initialSupportingOrgs={supportingOrganizations} 
            initialClientCompanies={clientCompanies} 
        />
    );
}
