"use client";

import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'


enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
 }

 interface SavedMessage {
    role: "user" | "system" | "assistant";
    content : string;
 }

const Agent = ({
    userName,
 /*   userId,
    interviewId,
    feedbackId,
    type,
    questions, */
} : AgentProps) => {

    const router = useRouter();
    const [callStatus,setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages,setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking,setIsSpeaking] = useState(false);
    const [lastMessage,setLastMessage] = useState<string>("");


    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
        } 

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);

        }

        const onMessage = (message: Message) => {
            if(messages.type === "transcript" && messages.transcriptType === "final") {
                const newMessage = {role : messages.role, content  : messages.transcript};
                setMessage((prev) => [...prev,newMessage])
            }
        }

        const onSpeechStart = () => {
            console.log("speech start");
            setIsSpeaking(true);
        }

        const onSpeechEnd = () => {
            console.log("speech end");
            setIsSpeaking(false);
        }

        const onError = (error:Error) => {
            console.log("Error:",error);
        }

        vapi.on("call-start",onCallStart);
        vapi.on("call-end",onCallEnd);
        vapi.on("message",onMessage);
        vapi.on("speech-start",onSpeechStart);
        vapi.on("speech-end",onSpeechEnd);
        vapi.on("error",onError);

        return () =>  {
            vapi.off("call-start",onCallStart);
            vapi.off("call-end",onCallEnd);
            vapi.off("message",onMessage);
            vapi.off("speech-start",onSpeechStart);
            vapi.off("speach-end",onSpeechEnd);
            vapi.off("error",onError);
        }

    },[]);

    useEffect(() => {
        if(messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }

        const handleGenerateFeedback = async (messages : SavedMessage[]) => {
            console.log("handleGenerateFeedback");

            const {success,feedbackId : id} = await createFeedback({
                interviewID : InterviewByUserId,
                userID : UserId,
                transcript : messages,
                feedbackId,

            })

            if(success && id) {
                router.push(`/interview/${interviewId}/feedback`)
            }
            else {
                console.log("Error saving feedback");
                router.push("/");
            }
        }
    })

  return (
    <>
    <div>
        <div>
            <div>
                <Image
                src="/ai-avatar.png"
                alt="profile-image"
                width={65}
                height={54}
                />
                {isSpeaking && <span className='animate-speak'/>}
            </div>
            <h3>AI Interview</h3>
        </div>

        <div>
            <div>
                <Image
                src="/user-avatar.png"
                alt="profile-image"
                width={539}
                height={539}
                />
                <h3>{userName}</h3>
            </div>
        </div>
    </div>
    {messages.length > 0 && (
        <div>
            <div>
                <p>{lastMessage}</p>
            </div>
        </div>
    )}

    <div>
        {callStatus !== "ACTIVE" ? (
            <button>
                <span></span>
                <span></span>
            </button>
        ) : (
            <button>End</button>
        )}
    </div>
    </>
)
}

export default Agent