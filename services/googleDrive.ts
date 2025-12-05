// Google Drive Sync Engine
// Handles Authenticating, Finding the Vault file, Downloading, and Uploading.

const VAULT_FILE_NAME = "finstruct_vault.enc";
const SCOPE = "https://www.googleapis.com/auth/drive.appdata";

// Paranoid-safe check for environment variables to prevent startup crashes.
const getEnvVar = (name: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[name] || "";
  }
  return "";
};


// 1. Authentication
export const authenticateWithGoogle = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const clientId = getEnvVar('VITE_APP_GOOGLE_CLIENT_ID');
        
        // CHECK FOR MISSING ID: Enter Simulation Mode to avoid OAuth Error
        if (!clientId) {
            console.warn("Google Client ID environment variable not set. Entering Simulation Mode.");
            setTimeout(() => {
                resolve("SIMULATED_TOKEN"); 
            }, 800);
            return;
        }

        try {
            if (!(window as any).google || !(window as any).google.accounts) {
                throw new Error("Google Identity Services script not loaded.");
            }
            const client = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: SCOPE,
                callback: (response: any) => {
                    if (response.access_token) {
                        resolve(response.access_token);
                    } else {
                        reject("Google Login Failed: No token received");
                    }
                },
                error_callback: (err: any) => reject(err)
            });
            
            client.requestAccessToken();
            
        } catch (e) {
            console.error("Google Script error or not loaded:", e);
            // Fallback to simulation if script fails
            resolve("SIMULATED_TOKEN");
        }
    });
};

// 2. Find the Vault File
export const findVaultFile = async (accessToken: string): Promise<string | null> => {
    if (accessToken === "SIMULATED_TOKEN") {
        return localStorage.getItem("simulated_drive_file_id");
    }

    const query = `name = '${VAULT_FILE_NAME}' and trashed = false and 'appDataFolder' in parents`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
    
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) throw new Error("Failed to list files");
    
    const data = await res.json();
    if (data.files && data.files.length > 0) {
        return data.files[0].id;
    }
    return null;
};

// 3. Download Content
export const downloadVault = async (fileId: string, accessToken: string): Promise<string> => {
    if (accessToken === "SIMULATED_TOKEN") {
        // Return stored encrypted content or empty JSON if missing
        return localStorage.getItem("simulated_drive_content") || "";
    }

    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) throw new Error("Failed to download vault");
    return await res.text(); // The encrypted string
};

// 4. Upload/Update Content
export const uploadVault = async (encryptedContent: string, accessToken: string, existingFileId?: string): Promise<string> => {
    if (accessToken === "SIMULATED_TOKEN") {
        localStorage.setItem("simulated_drive_content", encryptedContent);
        if (!existingFileId) {
            const newId = "SIM_FILE_" + Date.now();
            localStorage.setItem("simulated_drive_file_id", newId);
            return newId;
        }
        return existingFileId;
    }

    const metadata = {
        name: VAULT_FILE_NAME,
        mimeType: 'application/json',
        parents: existingFileId ? [] : ['appDataFolder'] // Save to hidden app folder
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([encryptedContent], { type: 'text/plain' }));

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (existingFileId) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
        method = 'PATCH';
    }

    const res = await fetch(url, {
        method: method,
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form
    });

    if (!res.ok) throw new Error("Drive Upload Failed");
    const json = await res.json();
    return json.id;
};