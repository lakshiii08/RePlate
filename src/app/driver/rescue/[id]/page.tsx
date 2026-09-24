'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { donationService } from '@/services/donationService';
import { rescueService } from '@/services/rescueService';
import { Donation } from '@/types';
import dynamic from 'next/dynamic';
import RescueCountdown from '@/components/ui/RescueCountdown';

const RescueMap = dynamic(() => import('@/components/map/RescueMap'), { ssr: false });
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Thermometer,
  Camera,
  Lock,
  FileCheck,
  AlertTriangle,
  MapPin,
  Building2,
  Utensils,
  ArrowRight,
  Phone,
  Sparkles,
} from 'lucide-react';

export default function DriverActiveRescuePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [donation, setDonation] = useState<Donation | null>(null);

  // Workflow Step: 1 = ACCEPTED, 2 = PICKUP_STARTED, 3 = PICKUP_VERIFIED, 4 = DELIVERY_STARTED, 5 = DELIVERED
  const [workflowStep, setWorkflowStep] = useState(1);

  // Verification Modals
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Pickup Verification Form
  const [pickupTemp, setPickupTemp] = useState(65.5);
  const [packagingVerified, setPackagingVerified] = useState(true);
  const [pickupPin, setPickupPin] = useState('1024');

  // Delivery Verification Form
  const [deliveryTemp, setDeliveryTemp] = useState(62.0);
  const [recipientName, setRecipientName] = useState('Sister Mary / Hope Shelter');
  const [signatureText, setSignatureText] = useState('SMary_Signed');

  useEffect(() => {
    async function loadData() {
      const d = await donationService.getDonationById(resolvedParams.id);
      setDonation(d);
      if (d?.status === 'PICKED_UP' || d?.status === 'IN_TRANSIT') {
        setWorkflowStep(3);
      } else if (d?.status === 'DELIVERED') {
        setWorkflowStep(5);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  const handleCompletePickupVerification = async () => {
    if (!donation) return;
    const updated = await rescueService.verifyPickup(donation.id, {
      tempCelsius: Number(pickupTemp),
      packagingVerified,
      pinCode: pickupPin,
      driverId: 'driver-1',
    });
    setDonation(updated);
    setShowPickupModal(false);
    setWorkflowStep(3); // Picked up / In Transit
  };

  const handleCompleteDeliveryVerification = async () => {
    if (!donation) return;
    const updated = await rescueService.verifyDelivery(donation.id, {
      tempCelsius: Number(deliveryTemp),
      recipientName,
      recipientSignature: signatureText,
    });
    setDonation(updated);
    setShowDeliveryModal(false);
    setWorkflowStep(5); // Delivered!

    // Trigger confetti celebration!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }
  };

  if (!donation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-semibold text-xs">
        Loading Driver Mobile Navigation Console...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Mobile Top Header */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400 font-mono">DRIVER MOBILE HUD</div>
            <h1 className="font-extrabold text-sm">Rescue #{donation.id}</h1>
          </div>
        </div>
        <RescueCountdown deadline={donation.pickupDeadline} compact />
      </div>

      {/* NAVIGATION MAP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-md h-72 relative">
        <RescueMap
          donations={[donation]}
          shelters={donation.matchedShelter ? [donation.matchedShelter] : []}
          drivers={donation.assignedDriver ? [donation.assignedDriver] : []}
          activeDonationId={donation.id}
          height="270px"
        />
      </div>

      {/* RESCUE DETAILS CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">{donation.foodName}</h3>
            <p className="text-xs text-slate-500">{donation.quantity} &bull; {donation.category}</p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase">
            {donation.storageMethod.replace('_', ' ')}
          </span>
        </div>

        {/* Pickup & Destination Cards */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="text-emerald-700 font-bold uppercase text-[10px] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> PICKUP LOCATION
            </div>
            <strong className="text-slate-900 block">{donation.donorName}</strong>
            <div className="text-slate-600">{donation.donorAddress}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="text-blue-700 font-bold uppercase text-[10px] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> DESTINATION SHELTER
            </div>
            <strong className="text-slate-900 block">{donation.matchedShelter?.name || 'Hope Shelter'}</strong>
            <div className="text-slate-600">{donation.matchedShelter?.address || '452 Elm Street'}</div>
          </div>
        </div>

        {/* Safety & Allergens warning */}
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Thermal Audit Specs:</strong> Maintain hot items above 60°C. Verified clean packaging required at pickup.
          </div>
        </div>
      </div>

      {/* WORKFLOW ACTION BUTTONS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-md">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rescue Workflow Actions</h4>

        {workflowStep === 1 && (
          <button
            onClick={() => setWorkflowStep(2)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" /> Start Pickup Navigation
          </button>
        )}

        {workflowStep === 2 && (
          <button
            onClick={() => setShowPickupModal(true)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" /> Arrived at Donor & Confirm Pickup
          </button>
        )}

        {workflowStep === 3 && (
          <button
            onClick={() => setWorkflowStep(4)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Truck className="w-5 h-5" /> Start Delivery to Shelter
          </button>
        )}

        {workflowStep === 4 && (
          <button
            onClick={() => setShowDeliveryModal(true)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <FileCheck className="w-5 h-5" /> Confirm Shelter Delivery & Sign-Off
          </button>
        )}

        {workflowStep === 5 && (
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-300 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-emerald-900 text-sm">Rescue Completed & Verified!</h4>
            <p className="text-xs text-emerald-700">Digital certificate of safety generated and shelter stock updated.</p>
            <Link
              href="/driver/dashboard"
              className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl mt-2"
            >
              Return to Driver Workspace
            </Link>
          </div>
        )}

        <button
          onClick={() => setShowReportModal(true)}
          className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Report Safety or Access Issue
        </button>
      </div>

      {/* SECTION 16: PICKUP VERIFICATION MODAL */}
      {showPickupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Pickup Safety Audit</h3>
              </div>
              <button onClick={() => setShowPickupModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Measured Food Temperature (°C)</span>
                  <span className="text-emerald-600 font-mono font-bold">&gt;60°C Required</span>
                </label>
                <div className="relative">
                  <Thermometer className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.1"
                    value={pickupTemp}
                    onChange={(e) => setPickupTemp(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm font-bold text-slate-800"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={packagingVerified}
                  onChange={(e) => setPackagingVerified(e.target.checked)}
                />
                <span><strong>Packaging Audit Passed:</strong> Insulated food containers sealed and covered properly.</span>
              </label>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Driver Verification PIN</label>
                <input
                  type="text"
                  value={pickupPin}
                  onChange={(e) => setPickupPin(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-sm font-mono font-bold"
                />
              </div>

              {/* Photo Upload Simulation Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-300 text-center space-y-1">
                <Camera className="w-5 h-5 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-700">Photo Proof Attached</div>
                <div className="text-[10px] text-emerald-600 font-mono">thermal_pickup_proof_RP1024.jpeg</div>
              </div>
            </div>

            <button
              onClick={handleCompletePickupVerification}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Verify Thermal Audit & Confirm Pickup
            </button>
          </div>
        </div>
      )}

      {/* SECTION 16: DELIVERY VERIFICATION MODAL */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Recipient Handover Sign-Off</h3>
              </div>
              <button onClick={() => setShowDeliveryModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Final Handover Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={deliveryTemp}
                  onChange={(e) => setDeliveryTemp(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl text-xs font-bold text-emerald-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Digital Recipient Signature</label>
                <div className="h-20 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-center font-mono text-xs font-extrabold text-slate-500 italic">
                  ✍️ {signatureText} (Digitally Verified)
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteDeliveryVerification}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Complete Rescue & Emit Certificate
            </button>
          </div>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-sm">Report Rescue Operational Issue</h3>
            <textarea
              rows={3}
              className="w-full p-3 border rounded-xl text-xs"
              placeholder="Describe access barrier, food decay, or delay..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="w-1/2 py-2 bg-slate-100 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Issue flagged. Dynamic re-routing dispatch informed.');
                  setShowReportModal(false);
                }}
                className="w-1/2 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
              >
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
