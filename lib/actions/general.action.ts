"use server";

import { db } from "@/firebase/admin";

export async function getInterviewById(id : string) : Promise<Interview | null> {
    const interview = await db.collection("interviews").doc(id).get();

    return interview.data() as Interview | null;
}

export async function getLatestInterviews(
    params: GetLatestInterviewsParams
) : Promise<Interview[] | null> {
    const {userId,limit = 20} = params;

    if(!userId) {
        console.log('User ID is undefineeed');
        return null;
    }

    const interviews = await db
    .collection("interviews")
    .orderBy("createdAt","desc")
    .where("finalized", "==",true)
    .where("userId","!=",userId)
    .limit(limit)
    .get()

    return interviews.docs.map((doc) => ({
        id : doc.id,
        ...doc.data(),
    })) as Interview[];

}

export async function getInterviewsByUserId(
    userId : string
) : Promise<Interview[] | null> {

if(!userId){
    console.log("userId is not defineeeed");
    return null;
}

    const interviews = await db
    .collection("interviews")
    .where("userId","==",userId)
    .orderBy("createdAt","desc")
    .get();

    return interviews.docs.map((doc) => ({
        id : doc.id,
        ...doc.data(),
    })) as Interview[];
}