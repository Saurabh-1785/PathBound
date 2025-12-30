/**
 * API service for communicating with PathBound backend monitoring service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface PendingIntent {
    id: string;
    signedXdr: string;
    sourceCurrency: string;
    destCurrency: string;
    sourceAmount: string;
    targetRate: string;
    expiresAt: number;
    publicKey: string;
    isImmediateTransfer?: boolean;
}

export interface IntentStatus {
    id: string;
    status: 'pending' | 'executed' | 'expired' | 'cancelled' | 'failed';
    sourceCurrency: string;
    destCurrency: string;
    sourceAmount: string;
    targetRate: number;
    currentRate: number | null;
    expiresAt: number;
    createdAt: number;
    lastChecked: number | null;
    attempts: number;
    transactionHash?: string;
    error?: string;
}

/**
 * Submit an intent to the monitoring service
 * Returns immediateExecution flag if the transfer was executed immediately
 */
export async function submitIntent(intent: PendingIntent): Promise<{
    success: boolean;
    error?: string;
    immediateExecution?: boolean;
    transactionHash?: string;
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/intents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(intent),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to submit intent',
                immediateExecution: data.immediateExecution || false,
            };
        }

        return {
            success: true,
            immediateExecution: data.immediateExecution || false,
            transactionHash: data.transactionHash,
        };
    } catch (error) {
        console.error('Error submitting intent:', error);
        return { success: false, error: 'Failed to connect to monitoring service' };
    }
}


/**
 * Get status of a specific intent
 */
export async function getIntentStatus(id: string): Promise<IntentStatus | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/intents/${id}`);

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching intent status:', error);
        return null;
    }
}

/**
 * Get all intents for a public key
 */
export async function getIntents(publicKey?: string): Promise<IntentStatus[]> {
    try {
        const url = publicKey
            ? `${API_BASE_URL}/api/intents?publicKey=${encodeURIComponent(publicKey)}`
            : `${API_BASE_URL}/api/intents`;

        const response = await fetch(url);

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.intents || [];
    } catch (error) {
        console.error('Error fetching intents:', error);
        return [];
    }
}

/**
 * Cancel a pending intent
 */
export async function cancelIntent(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/intents/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const data = await response.json();
            return { success: false, error: data.error || 'Failed to cancel intent' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error cancelling intent:', error);
        return { success: false, error: 'Failed to connect to monitoring service' };
    }
}

/**
 * Check if the monitoring service is available
 */
export async function checkServiceHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
}
