import Agent from "@/components/Agent"
import { interviewCovers } from "@/constants"
import { getCurrentUser } from "@/lib/actions/auth.action"
import { getInterviewById } from "@/lib/actions/general.action"
import { getRandomInterviewCover } from "@/lib/utils"
import Image from "next/image"
import { redirect } from "next/navigation"


const InterviewDetails = async ({params} : RouteParams) => {

    const {id} = await params;
    const  user = await getCurrentUser();

    const interview = await getInterviewById(id);

    if(!interview) redirect("/");


    
    return (
        <>
        <div>
            <div>
                <div>
                    <Image
                    src={getRandomInterviewCover()}
                    alt="cover-image"
                    width={40}
                    height={40}
                    />
                    <h3>{interview.role} Interview</h3>
                </div>

              {//  <DisplayTechIcons /> 
}


            </div>
            <p>{interview.type}</p>
        </div>

        <Agent
        userName={user?.name}
      {/*  userId={user.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        feedbackId={feedback.id}
        */}
        />
        </>
    )
}

export default InterviewDetails;