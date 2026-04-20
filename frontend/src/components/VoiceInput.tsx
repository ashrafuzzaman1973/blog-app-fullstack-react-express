import { useState } from 'react';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    isProcessing: boolean;
}

export default function VoiceInput({ onTranscript, isProcessing }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support voice recognition. Please use Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD'; // Set to Bangla
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript); // Send the Bangla text to the parent
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    return (
        <button
            onClick={startListening}
            disabled={isListening || isProcessing}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${
                isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            } disabled:bg-slate-200 disabled:text-slate-400`}
        >
            {isListening ? (
                <>🛑 Listening...</>
            ) : isProcessing ? (
                <>🪄 Converting...</>
            ) : (
                <>🎙️ Speak Bangla</>
            )}
        </button>
    );
}