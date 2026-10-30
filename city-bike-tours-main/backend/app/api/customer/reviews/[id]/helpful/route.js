import {NextResponse} from "next/server";
import {and,eq} from "drizzle-orm";
import {db} from "@/db/client";
import {reviews,reviewVotes} from "@/db/schema";
import {requireCustomer} from "@/lib/customer-auth";
import {rateLimit} from "@/lib/rate-limit";
export async function POST(request,{params}){const auth=await requireCustomer(request);if(auth.error)return auth.error;if(!rateLimit("review-vote:"+auth.user.id,60,60*60*1000))return NextResponse.json({error:"Please slow down and try again."},{status:429});const [review]=await db.select({id:reviews.id}).from(reviews).where(and(eq(reviews.id,params.id),eq(reviews.status,"approved"))).limit(1);if(!review)return NextResponse.json({error:"Review not found."},{status:404});const existing=await db.select().from(reviewVotes).where(and(eq(reviewVotes.reviewId,params.id),eq(reviewVotes.userId,auth.user.id))).limit(1);if(existing.length)await db.delete(reviewVotes).where(and(eq(reviewVotes.reviewId,params.id),eq(reviewVotes.userId,auth.user.id)));else await db.insert(reviewVotes).values({reviewId:params.id,userId:auth.user.id});const rows=await db.select().from(reviewVotes).where(eq(reviewVotes.reviewId,params.id));return NextResponse.json({helpfulCount:rows.length,voted:!existing.length});}
