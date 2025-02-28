/**
 * Interface representing a user address response from the API
 */
export interface AddressResponseDTO {
    addressId: number;
    userId: number;
    addressLine: string;
    city?: string;
    district?: string;
    ward?: string;
    phoneNumber: string;
    isDefault: boolean;
    fullAddress?: string;
}

/**
 * Interface for creating a new address
 */
export interface AddressRequestDTO {
    addressLine: string;
    city?: string;
    district?: string;
    ward?: string;
    phoneNumber: string;
    isDefault?: boolean;
}

/**
 * Interface for updating an existing address
 */
export interface UpdateAddressDTO {
    addressLine?: string;
    city?: string;
    district?: string;
    ward?: string;
    phoneNumber?: string;
    isDefault?: boolean;
}