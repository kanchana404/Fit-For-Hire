// types/clerk.ts

export interface UserData {
    id: string;
    first_name?: string;
    last_name?: string;
    email_addresses: EmailAddress[];
    primary_email_address_id: string;
    // Add other fields as necessary
  }
  
  export interface EmailAddress {
    id: string;
    email_address: string;
    // Add other fields as necessary
  }
  
  export interface WebhookEvent {
    id: string;
    type: string;
    data: UserData;
    // Add other fields as necessary
  }
  