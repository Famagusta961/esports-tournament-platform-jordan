/**
 * Authenticated Database Client - Wrapper for kliv-database.js with authentication
 * This file adds authentication headers to all database requests
 */

import db from '@/lib/shared/kliv-database.js';
import auth from '@/lib/shared/kliv-auth.js';

class AuthenticatedDatabase {
    constructor() {
        this.db = db;
    }

    /**
     * Make authenticated API request
     * Note: Authentication is handled automatically via browser cookies
     */
    async request(method, table, params = {}, body = null) {
        // Get the URL from the original db client
        const url = this.db.buildUrl(table, params);
        const options = {
            method,
            headers: {'Accept': 'application/json'},
            credentials: 'include' // Important: Include cookies for authentication
        };

        // Log authentication status for debugging
        try {
            const user = await auth.getUser();
            console.log('AuthenticatedDatabase: User auth status', { 
                hasUser: !!user, 
                userUuid: user?.uuid,
                method, 
                table 
            });
        } catch (error) {
            console.log('AuthenticatedDatabase: No user session found', { method, table });
        }

        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `${method} request failed`);
        }

        return data;
    }

    /**
     * Query records (SELECT) with authentication
     */
    async query(table, params = {}) {
        if (!table) throw new Error('Table name is required');
        return this.request('GET', table, params);
    }

    /**
     * Get single record by ID with authentication
     */
    async get(table, id) {
        const results = await this.query(table, {_row_id: `eq.${id}`});
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Insert record(s) with authentication
     */
    async insert(table, data) {
        if (!table) throw new Error('Table name is required');
        return this.request('POST', table, {}, data);
    }

    /**
     * Update records with authentication
     */
    async update(table, params, data) {
        if (!table) throw new Error('Table name is required');
        return this.request('PUT', table, params, data);
    }

    /**
     * Delete records with authentication
     */
    async delete(table, params) {
        if (!table) throw new Error('Table name is required');
        if (!params || Object.keys(params).length === 0) {
            throw new Error('Filters required for delete (safety)');
        }
        return this.request('DELETE', table, params);
    }

    /**
     * Count records with authentication
     */
    async count(table, params = {}) {
        const newParams = {...params, select: 'count'};
        const result = await this.request('GET', table, newParams);
        return result.count || 0;
    }
}

// Export singleton instance
const authDb = new AuthenticatedDatabase();
export {authDb, AuthenticatedDatabase};
export default authDb;