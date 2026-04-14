export type OtpDeliveryPayload = {
  to: string;
  message: string;
};

export abstract class OtpGateway {
  abstract sendOtp(payload: OtpDeliveryPayload): Promise<void>;
}
