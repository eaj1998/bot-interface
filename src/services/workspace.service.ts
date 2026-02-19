import axios from 'axios';
import { tokenService } from '@/lib/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface CreateWorkspacePayload {
    name: string;
    slug?: string;
}

export interface CreatedWorkspace {
    id: string;
    name: string;
    slug: string;
    role: string;
    [key: string]: unknown;
}

/**
 * Cria um novo workspace para o usuário autenticado.
 *
 * Usa uma instância axios limpa (sem interceptors) para evitar que o
 * middleware de workspace do backend rejeite a requisição com 403
 * quando o usuário ainda não pertence a nenhum workspace.
 */
export const createWorkspace = async (
    payload: CreateWorkspacePayload
): Promise<CreatedWorkspace> => {
    const token = tokenService.getAccessToken();

    const response = await axios.post(
        `${API_BASE_URL}/workspaces`,
        payload,
        {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        }
    );

    const data = response.data;
    // A API pode retornar { data: workspace } ou o workspace diretamente
    return data.data ?? data;
};
