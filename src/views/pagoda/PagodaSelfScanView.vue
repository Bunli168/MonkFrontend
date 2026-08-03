<template>
    <div class="card bg-white p-3 shadow-sm border-0 rounded-4">
        <div class="text-center mb-4">

            <div class="mt-3 p-3 rounded-3 d-inline-block text-start border" style="background-color: var(--surface-ground);" v-if="authStore.user?.profile?.seating_row_id || authStore.user?.UserProfile?.seating_row_id">
                <div class="d-flex align-items-center gap-3">
                    <div>
                        <h6 class="fw-bold mb-1 text-primary">Your Seating</h6>
                        <div class="text-dark fw-medium" style="font-size: 0.95rem;">
                            Row {{ authStore.user?.profile?.seatingRow?.row_num || authStore.user?.profile?.seating_row_id || authStore.user?.UserProfile?.seating_row_id }}
                            <span v-if="authStore.user?.profile?.seat_number || authStore.user?.UserProfile?.seat_number" class="ms-1">
                                (Seat {{ authStore.user?.profile?.seat_number || authStore.user?.UserProfile?.seat_number }})
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-3 p-3 rounded-3 d-inline-block text-start border bg-white shadow-sm" v-else>
                <div class="d-flex align-items-center gap-2 text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h6 class="fw-bold mb-0">No Seat Assigned</h6>
                </div>
                <p class="text-muted small mb-0 mt-2">Please go to "Register Seat" tab to register your seat.</p>
            </div>
        </div>
        
        <!-- Success State -->
        <div v-if="scannedData && !isError" class="text-center py-4">
            <div class="mb-4 d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style="width: 80px; height: 80px;">
                <i class="fas fa-check fa-3x"></i>
            </div>
            <h4 class="fw-bold text-dark mb-1">Scan Successful!</h4>
            <p class="text-muted mb-4">You have been marked as present.</p>
            
            <div class="bg-light rounded-4 p-4 text-start d-inline-block shadow-sm border mb-4" style="min-width: 250px;">
                <div class="small text-muted text-uppercase fw-bold mb-2">Attendance Details</div>
                <div class="fs-5 fw-bold text-primary mb-2">{{ scannedData.name }}</div>
                <div class="d-flex align-items-center gap-3 text-dark fw-medium">
                    <div><i class="fas fa-chair text-muted me-2"></i>Row {{ scannedData.row }}</div>
                    <div><i class="fas fa-user text-muted me-2"></i>Seat {{ scannedData.seat }}</div>
                </div>
            </div>
            
            <div>
                <BaseButton variant="primary" class="px-5 py-2 shadow-sm" @click="confirmScan">
                    Confirm
                </BaseButton>
            </div>
        </div>
        
        <!-- Scanner State -->
        <div v-else>
            <div class="d-flex justify-content-center w-100 mb-4">
                <div style="position: relative; width: 100%; max-width: 500px; min-height: 300px;">
                    <div id="qr-reader" style="width: 100%; height: 100%; border-radius: 16px; overflow: hidden; border: 2px solid var(--primary-color); background-color: var(--surface-ground);">
                    </div>
                    <div v-if="!isScanning" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                        <span class="text-muted"><i class="fas fa-camera fa-2x mb-2 d-block text-center"></i> Camera Off</span>
                    </div>
                </div>
            </div>
            
            <div v-if="isError && scanResult" class="p-3 rounded-3 mb-4 text-center bg-danger bg-opacity-10 text-danger border border-danger">
                <div class="d-flex align-items-center justify-content-center gap-2">
                    <i class="fas fa-exclamation-circle"></i>
                    <span class="fw-bold">{{ scanResult }}</span>
                </div>
            </div>
            
            <div class="text-center d-flex justify-content-center gap-2">
                <BaseButton variant="primary" class="px-4 py-2 shadow-sm" @click="startScanner" v-if="!isScanning">
                    <i class="fas fa-camera me-2"></i> Open Camera
                </BaseButton>
                <template v-if="isScanning">
                    <BaseButton variant="outline-danger" class="px-4 py-2" @click="stopScanner">
                        <i class="fas fa-stop me-2"></i> Stop
                    </BaseButton>
                    <BaseButton variant="outline-secondary" class="px-4 py-2" @click="flipCamera">
                        <i class="fas fa-sync-alt me-2"></i> Flip Camera
                    </BaseButton>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/base/BaseButton.vue';

const toast = useToastStore();
const authStore = useAuthStore();
const emit = defineEmits(['close']);

const scanResult = ref('');
const scannedData = ref(null);
const isError = ref(false);
const isScanning = ref(false);
const isProcessing = ref(false);
const currentFacingMode = ref('environment');
let html5QrCode = null;

const startScanner = async () => {
    isScanning.value = true;
    scanResult.value = '';
    scannedData.value = null;
    
    html5QrCode = new Html5Qrcode("qr-reader");
    try {
        await html5QrCode.start(
            { facingMode: currentFacingMode.value },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            onScanSuccess,
            onScanFailure
        );
    } catch (err) {
        isError.value = true;
        scanResult.value = 'Failed to access camera. Please allow camera permissions.';
        isScanning.value = false;
        console.error(err);
    }
};

const stopScanner = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
        await html5QrCode.stop();
        html5QrCode.clear();
    }
    isScanning.value = false;
};

const flipCamera = async () => {
    if (isScanning.value) {
        await stopScanner();
        currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment';
        await startScanner();
    }
};

const onScanSuccess = async (decodedText, decodedResult) => {
    if (isProcessing.value) return;
    isProcessing.value = true;
    
    try {
        const data = JSON.parse(decodedText);
        
        if (!data.token || !data.seating_row_id || !data.date) {
            throw new Error('Invalid QR Code format.');
        }
        
        // Stop scanning to process
        await stopScanner();
        
        const res = await api.post('/attendances/scan-self', data);
        if (res.data.success) {
            isError.value = false;
            scanResult.value = res.data.message || 'Successfully marked as Present!';
            scannedData.value = res.data.data;
            toast.showToast('Successfully marked present!', 'success');
        }
    } catch (error) {
        isError.value = true;
        scanResult.value = error.response?.data?.message || error.message || 'Failed to process QR code.';
        toast.showToast('Scan failed', 'error');
        // Restart scanner after 3 seconds on error
        setTimeout(() => {
            if (!isScanning.value && !scanResult.value.includes('Present')) {
                startScanner();
            }
        }, 3000);
    } finally {
        isProcessing.value = false;
    }
};

const onScanFailure = (error) => {
    // This is called constantly when no QR code is in frame, just ignore.
};

const confirmScan = () => {
    emit('close');
};

onUnmounted(() => {
    stopScanner();
});
</script>

<style scoped>
#qr-reader video {
    object-fit: cover !important;
}
</style>
