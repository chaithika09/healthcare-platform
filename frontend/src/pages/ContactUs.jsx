import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ContactUs() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    // Opens Gmail with pre-filled message
    const subject = encodeURIComponent(`[MedIQ+ Support] ${watch("subject") || "General Inquiry"}`);
    const body = encodeURIComponent(`Name: ${watch("firstName")} ${watch("lastName")}\nEmail: ${watch("email")}\n\nMessage:\n${watch("message") || ""}`);
    window.open(`https://mail.google.com/mail/?view=cm&to=lschaithika@gmail.com&su=${subject}&body=${body}`, "_blank");
    setSent(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Contact Us</h1>
        <p className="text-gray-500 text-sm mt-1">We're here to help. Reach out anytime.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: FiMail,   label: "Email",   value: "support@smarthealthcare.com", color: "bg-blue-100 text-blue-600" },
            { icon: FiPhone,  label: "Phone",   value: "+1 (800) 555-HEALTH",         color: "bg-green-100 text-green-600" },
            { icon: FiMapPin, label: "Address", value: "123 Healthcare Blvd, New York, NY 10001", color: "bg-purple-100 text-purple-600" },
          ].map((item) => (
            <div key={item.label} className="card p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}

          <div className="card p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Support Hours</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>Mon – Fri</span><span className="font-medium">8 AM – 8 PM EST</span></div>
              <div className="flex justify-between"><span>Saturday</span><span className="font-medium">9 AM – 5 PM EST</span></div>
              <div className="flex justify-between"><span>Sunday</span><span className="font-medium">Emergency only</span></div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2 card p-6">
          {!sent ? (
            <>
              <h2 className="font-heading font-semibold text-gray-900 mb-5">Send us a message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name *</label>
                    <input {...register("firstName", { required: true })} placeholder="John" className="input" />
                  </div>
                  <div>
                    <label className="label">Last Name *</label>
                    <input {...register("lastName", { required: true })} placeholder="Smith" className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input {...register("email", { required: true })} type="email" placeholder="john@email.com" className="input" />
                </div>
                <div>
                  <label className="label">Subject *</label>
                  <select {...register("subject", { required: true })} className="input">
                    <option value="">Select a subject</option>
                    <option>Technical Support</option>
                    <option>Billing & Payments</option>
                    <option>Appointment Issues</option>
                    <option>Account Problems</option>
                    <option>General Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea {...register("message", { required: true })} rows={5} placeholder="Describe your issue or question..." className="input resize-none" />
                </div>
                <button type="submit" className="btn-primary btn-lg w-full justify-center gap-2">
                  <FiSend size={16} /> Send Message
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Message Sent!</h3>
              <p className="text-gray-500 text-sm mt-2">We'll respond within 24 hours.</p>
              <button onClick={() => setSent(false)} className="btn-outline mt-6">Send Another</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
