// =====================================================
// LOYALTY DASHBOARD COMPONENT
// =====================================================

'use client';

import React from 'react';
import { useLoyalty, useDailyLogin } from '@/lib/loyalty/useLoyalty';
import { LOYALTY_TIERS, formatPoints, formatCurrency, getTierIcon, getTierColor } from '@/lib/loyalty/loyalty-core';

interface LoyaltyDashboardProps {
  userId?: string;
}

export function LoyaltyDashboard({ userId }: LoyaltyDashboardProps) {
  const { 
    user, 
    transactions, 
    expiringPoints, 
    availableRewards,
    activeChallenges,
    recentAchievements,
    isLoading, 
    error,
    refreshUserData,
    canRedeem
  } = useLoyalty();

  if (isLoading) {
    return (
      <div className="loyalty-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your rewards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loyalty-dashboard error">
        <div className="error-message">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={refreshUserData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loyalty-dashboard empty">
        <div className="join-prompt">
          <h2>Join Our Loyalty Program</h2>
          <p>Earn points on every purchase and unlock exclusive rewards!</p>
          <button className="join-btn">Join Now</button>
        </div>
      </div>
    );
  }

  const tierConfig = LOYALTY_TIERS[user.tier];
  const nextTier = user.nextTier ? LOYALTY_TIERS[user.nextTier] : null;

  return (
    <div className="loyalty-dashboard">
      {/* Header Section */}
      <div className="dashboard-header" style={{ background: `linear-gradient(135deg, ${tierConfig.color}40, ${tierConfig.color}20)` }}>
        <div className="tier-badge">
          <span className="tier-icon">{tierConfig.icon}</span>
          <span className="tier-name">{tierConfig.displayName}</span>
        </div>
        
        <div className="points-display">
          <div className="current-points">
            <span className="points-value">{formatPoints(user.currentPoints)}</span>
            <span className="points-label">Available Points</span>
          </div>
          <div className="lifetime-points">
            <span className="lifetime-value">{formatPoints(user.lifetimePoints)}</span>
            <span className="lifetime-label">Lifetime Points</span>
          </div>
        </div>

        {nextTier && (
          <div className="tier-progress">
            <div className="progress-header">
              <span>Progress to {nextTier.displayName}</span>
              <span className="progress-percent">{user.tierProgress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${user.tierProgress}%`,
                  backgroundColor: tierConfig.color 
                }}
              />
            </div>
            <div className="progress-details">
              <span>{formatPoints(user.pointsToNext)} points or {formatCurrency(user.spendToNext)} to go</span>
            </div>
          </div>
        )}

        <div className="tier-benefits-summary">
          <h4>Your {tierConfig.displayName} Benefits</h4>
          <ul>
            <li>{tierConfig.pointsMultiplier}x Points on purchases</li>
            <li>{tierConfig.discountPercent}% Discount on all orders</li>
            {tierConfig.perks.slice(0, 2).map((perk, i) => (
              <li key={i}>{perk}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(user.lifetimeSpent)}</span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <span className="stat-value">{user.totalPurchases}</span>
            <span className="stat-label">Purchases</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{user.totalReferrals}</span>
            <span className="stat-label">Referrals</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <span className="stat-value">{user.achievements}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{user.joinDays}</span>
            <span className="stat-label">Days Member</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎁</div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(user.redeemableValue)}</span>
            <span className="stat-label">Redeemable Value</span>
          </div>
        </div>
      </div>

      {/* Expiring Points Alert */}
      {expiringPoints.length > 0 && (
        <div className="expiring-points-alert">
          <div className="alert-icon">⏰</div>
          <div className="alert-content">
            <h4>Points Expiring Soon!</h4>
            <p>
              {expiringPoints.reduce((sum, ep) => sum + ep.expiringPoints, 0).toLocaleString()} points 
              will expire within the next 30 days
            </p>
          </div>
          <button className="alert-action">Use Now</button>
        </div>
      )}

      {/* Daily Login */}
      <DailyLoginBonus />

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">🎁</span>
            <span className="action-label">Browse Rewards</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">👥</span>
            <span className="action-label">Invite Friends</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🏆</span>
            <span className="action-label">Achievements</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span className="action-label">History</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="activity-item">
              <div className="activity-icon">
                {tx.points > 0 ? '➕' : '➖'}
              </div>
              <div className="activity-details">
                <span className="activity-description">{tx.description}</span>
                <span className="activity-date">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={`activity-points ${tx.points > 0 ? 'positive' : 'negative'}`}>
                {tx.points > 0 ? '+' : ''}{formatPoints(tx.points)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="active-challenges">
          <h3>Active Challenges</h3>
          <div className="challenges-list">
            {activeChallenges.slice(0, 2).map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Rewards */}
      <div className="recommended-rewards">
        <h3>Recommended for You</h3>
        <div className="rewards-grid">
          {availableRewards.slice(0, 3).map((reward) => (
            <RewardCard key={reward.id} reward={reward} userPoints={user.currentPoints} />
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="recent-achievements">
          <h3>Recent Achievements</h3>
          <div className="achievements-row">
            {recentAchievements.slice(0, 4).map((ua) => (
              <AchievementBadge key={ua.id} userAchievement={ua} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Daily Login Bonus Component
function DailyLoginBonus() {
  const { streak, canClaim, claimDailyPoints } = useDailyLogin();

  return (
    <div className="daily-login-bonus">
      <div className="bonus-header">
        <h3>Daily Login Bonus</h3>
        <div className="streak-display">
          <span className="streak-fire">🔥</span>
          <span className="streak-count">{streak} Day Streak</span>
        </div>
      </div>
      
      <div className="bonus-content">
        <p>Log in every day to earn bonus points!</p>
        <div className="week-progress">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div 
              key={day}
              className={`day-circle ${day <= streak ? 'completed' : ''} ${day === streak + 1 && canClaim ? 'current' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {canClaim && (
          <button 
            className="claim-btn"
            onClick={() => claimDailyPoints(5)}
            disabled={!canClaim}
          >
            Claim 5 Points!
          </button>
        )}
      </div>
    </div>
  );
}

// Challenge Card Component
interface ChallengeCardProps {
  challenge: any;
}

function ChallengeCard({ challenge }: ChallengeCardProps) {
  const currentProgress = challenge.currentProgress || 0;
  const target = challenge.target || 100;
  const progress = Math.min(100, (currentProgress / target) * 100);
  
  return (
    <div className="challenge-card">
      <div className="challenge-header">
        <span className="challenge-badge">{challenge.category}</span>
        <span className="challenge-reward">🎁 {formatPoints(challenge.pointsReward)} pts</span>
      </div>
      <h4>{challenge.displayName}</h4>
      <p>{challenge.description}</p>
      
      <div className="challenge-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">
          {formatPoints(currentProgress)} / {formatPoints(target)}
        </span>
      </div>
      
      <button className="join-challenge-btn">Join Challenge</button>
    </div>
  );
}

// Reward Card Component
interface RewardCardProps {
  reward: any;
  userPoints: number;
}

function RewardCard({ reward, userPoints }: RewardCardProps) {
  const canRedeem = userPoints >= reward.pointsCost;

  return (
    <div className={`reward-card ${!canRedeem ? 'locked' : ''}`}>
      <div className="reward-image">
        {reward.category === 'discount' && '🏷️'}
        {reward.category === 'gift_card' && '💳'}
        {reward.category === 'merchandise' && '👕'}
        {reward.category === 'experience' && '🎭'}
        {reward.category === 'exclusive' && '⭐'}
      </div>
      
      <div className="reward-info">
        <h4>{reward.displayName}</h4>
        <p>{reward.description}</p>
        
        <div className="reward-value">
          <span className="points-cost">{formatPoints(reward.pointsCost)} pts</span>
          <span className="monetary-value">≈ {formatCurrency(reward.monetaryValue)}</span>
        </div>
        
        {reward.tierRequirement && (
          <span className="tier-requirement">Requires: {reward.tierRequirement}</span>
        )}
      </div>
      
      <button 
        className={`redeem-btn ${canRedeem ? 'available' : 'disabled'}`}
        disabled={!canRedeem}
      >
        {canRedeem ? 'Redeem' : `Need ${formatPoints(reward.pointsCost - userPoints)} more`}
      </button>
    </div>
  );
}

// Achievement Badge Component
interface AchievementBadgeProps {
  userAchievement: any;
}

function AchievementBadge({ userAchievement }: AchievementBadgeProps) {
  const achievement = userAchievement.achievement;
  
  return (
    <div className="achievement-badge" title={achievement?.description}>
      <div 
        className="badge-icon"
        style={{ backgroundColor: achievement?.badgeColor || '#FFD700' }}
      >
        {achievement?.badgeIcon || '🏆'}
      </div>
      <span className="badge-name">{achievement?.displayName}</span>
    </div>
  );
}

export default LoyaltyDashboard;
