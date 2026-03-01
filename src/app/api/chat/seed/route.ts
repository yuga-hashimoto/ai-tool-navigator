import { NextRequest, NextResponse } from 'next/server';

// POST /api/chat/seed - Seed default canned responses
export async function POST(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const defaultResponses = [
      {
        title: 'Welcome Message',
        content: 'Hello! Welcome to AI Tool Navigator. How can I assist you today?',
        category: 'GENERAL',
        keywords: 'hello,hi,hey,welcome',
      },
      {
        title: 'Pricing Question',
        content: 'Thank you for your interest in our pricing. We offer flexible plans starting from $29/month. Would you like me to explain the features of each plan?',
        category: 'SALES',
        keywords: 'pricing,price,cost,plan,tier,subscription',
      },
      {
        title: 'Feature Inquiry',
        content: 'Great question! Our AI tools offer features like natural language processing, image generation, code assistance, and more. Which specific feature would you like to know more about?',
        category: 'SALES',
        keywords: 'features,capabilities,what can,functionality',
      },
      {
        title: 'Technical Support',
        content: 'I understand you\'re experiencing a technical issue. To help you better, could you please provide more details about the problem you\'re facing?',
        category: 'TECHNICAL',
        keywords: 'error,bug,issue,problem,not working,broken',
      },
      {
        title: 'Billing Question',
        content: 'I can help you with your billing inquiry. Could you please provide your account email or order number so I can look into this for you?',
        category: 'BILLING',
        keywords: 'billing,invoice,payment,charge,refund,subscription',
      },
      {
        title: 'Account Help',
        content: 'I can help you with your account. What specific assistance do you need - login issues, password reset, or account settings?',
        category: 'GENERAL',
        keywords: 'account,login,password,reset,settings',
      },
      {
        title: 'Demo Request',
        content: 'I\'d be happy to arrange a demo for you! Could you please provide your preferred date and time, and I\'ll set up a personalized walkthrough of our platform.',
        category: 'SALES',
        keywords: 'demo,trial,walkthrough,presentation',
      },
      {
        title: 'Refund Request',
        content: 'I understand you\'d like to request a refund. I\'ll be happy to assist you with this. Could you please provide your order number and the reason for the refund?',
        category: 'BILLING',
        keywords: 'refund,money back,cancel',
      },
      {
        title: 'Feature Request',
        content: 'Thank you for your suggestion! We\'re always looking to improve our tools. I\'ll make sure to pass this feedback to our product team.',
        category: 'FEEDBACK',
        keywords: 'suggestion,feature request,improvement,would be nice',
      },
      {
        title: 'Bug Report',
        content: 'I\'m sorry to hear you\'ve encountered a bug. To help our team investigate, could you please describe the steps you took when the issue occurred and any error messages you saw?',
        category: 'BUG_REPORT',
        keywords: 'bug,crash,glitch,error,fault',
      },
      {
        title: 'Thank You - Closing',
        content: 'You\'re very welcome! Is there anything else I can help you with today?',
        category: 'GENERAL',
        keywords: 'thanks,thank you,appreciate',
      },
      {
        title: 'Response Time',
        content: 'I appreciate your patience. Our team is working hard to respond to all inquiries as quickly as possible.',
        category: 'GENERAL',
        keywords: 'waiting,long time,how long',
      },
      {
        title: 'Transfer to Specialist',
        content: 'I\'ll transfer you to a specialist who can better assist with your inquiry. One moment please.',
        category: 'GENERAL',
        keywords: 'transfer,specialist,expert',
      },
    ];

    // Check if responses already exist
    const existingCount = await prisma.cannedResponse.count();
    
    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Canned responses already exist (${existingCount} responses)`,
        action: 'skipped',
      });
    }

    // Create all default responses
    await prisma.cannedResponse.createMany({
      data: defaultResponses,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${defaultResponses.length} canned responses`,
      action: 'created',
    });
  } catch (error) {
    console.error('Error seeding canned responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed canned responses' },
      { status: 500 }
    );
  }
}

// GET /api/chat/seed - Check seed status
export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const count = await prisma.cannedResponse.count();

    return NextResponse.json({
      success: true,
      cannedResponsesCount: count,
      needsSeeding: count === 0,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check seed status' },
      { status: 500 }
    );
  }
}
