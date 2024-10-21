export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface NodeAuthMessage {
    type: 'auth';
    email: string;
}

export interface CheckpointUpdateNode {
    type: 'checkpointUpdate';
    id: string;
    status: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
    comment?: string;
}

export interface UserPushNotificationNode {
    type: 'pushNotification';
    content: string;
    userId: string;
}

export interface RoutePlanUpdateNode {
    type: 'routePlanUpdate';
    vehicleId: string;
    route: string[];
}

export interface TrafficUpdateNode {
    type: 'trafficUpdate';
    status: 'CONGESTED' | 'CLEAR' | 'UNKNOWN';
    affectedRoute: string;
}

export type MessageType =
    | NodeAuthMessage
    | CheckpointUpdateNode
    | UserPushNotificationNode
    | RoutePlanUpdateNode
    | TrafficUpdateNode;