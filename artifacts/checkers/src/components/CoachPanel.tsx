import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, TrendingUp, RefreshCw, Swords, Target,
  Crown, Zap, AlertTriangle, CheckCircle2, ChevronRight,
  Sword, Star, Brain
} from "lucide-react";
import { GameSummary, KeyMoment, posToAlg } from "@/lib/checkers";
import { Player } from "@/lib/checkers";

interface CoachPanelProps {
  summary: GameSummary;
  playerColor: Player;
  onRestart: () => void;
  onMenu: () => void;
}

const GRADE_CONFIG: Record<
  GameSummary["grade"],
  { label: string; color: string; bg: string; glow: string; desc: string }
> = {
  S: { label: "S", color: "text-amber-300", bg: "from-amber-400 to-orange-500", glow: "shadow-amber-400/50", desc: "Masterclass" },
  A: { label: "A", color: "text-violet-300", bg: "from-violet-400 to-purple-600", glow: "shadow-violet-400/50", desc: "Excellent" },
  B: { label: "B", color: "text-blue-300", bg: "from-blue-400 to-indigo-600", glow: "shadow-blue-400/40", desc: "Good play" },
  C: { label: "C", color: "text-teal-300", bg: "from-teal-400 to-cyan-600", glow: "shadow-teal-400/40", desc: "Average" },
  D: { label: "D", color: "text-orange-300", bg: "from-orange-400 to-red-500", glow: "shadow-orange-400/40", desc: "Needs work" },
  F: { label: "F", color: "text-red-300", bg: "from-red-500 to-rose-700", glow: "shadow-red-500/40", desc: "Keep practicing" },
};

const MOMENT_CONFIG: Record<
  KeyMoment["type"],
  { icon: typeof Target; color: string; bg: string; borderColor: string }
> = {
  missed_capture: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", borderColor: "border-red-500/20" },
  exposed_king:   { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", borderColor: "border-orange-500/20" },
  king_promoted:  { icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  multi_jump:     { icon: Zap, color: "text-violet-400", bg: "bg-violet-500/10", borderColor: "border-violet-500/20" },
  good_capture:   { icon: Sword, color: "text-green-400", bg: "bg-green-500/10", borderColor: "border-green-500/20" },
  safe_advance:   { icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10", borderColor: "border-blue-500/20" },
};

function ScoreRing({ score }: { score: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7"
        className="text-white/10" />
      <motion.circle
        cx="50" cy="50" r={r} fill="none"
        stroke="url(#scoreGrad)" strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - filled }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: typeof Target;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 280, damping: 24 }}
      className="glass rounded-2xl p-4 flex flex-col gap-1"
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${color}`}>
        <Icon size={15} className="text-white" />
      </div>
      <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground/70">{sub}</span>}
    </motion.div>
  );
}

function MomentRow({ moment, index }: { moment: KeyMoment; index: number }) {
  const cfg = MOMENT_CONFIG[moment.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.07, type: "spring", stiffness: 260, damping: 24 }}
      className={`flex gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.borderColor}`}
    >
      {/* Turn badge */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bg} border ${cfg.borderColor}`}>
          <Icon size={13} className={cfg.color} />
        </div>
        <span className="text-[9px] text-muted-foreground font-mono">T{moment.turn}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-semibold ${cfg.color}`}>{moment.label}</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {posToAlg(moment.from)}→{posToAlg(moment.to)}
          </span>
          {moment.captureCount > 0 && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${cfg.bg} ${cfg.color}`}>
              ×{moment.captureCount}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{moment.detail}</p>
      </div>
    </motion.div>
  );
}

const TIP_EMOJIS = ["🎯", "♟", "💡", "🔍", "⚡", "🛡️"];

export function CoachPanel({ summary, playerColor, onRestart, onMenu }: CoachPanelProps) {
  const grade = GRADE_CONFIG[summary.grade];
  const playerMoments = summary.keyMoments.filter((m) => m.player === playerColor);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className="fixed inset-0 z-40 mesh-bg overflow-y-auto"
      data-testid="coach-panel"
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20
          ${summary.playerWon ? "bg-amber-500" : "bg-violet-600"}`} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-24 space-y-6">

        {/* ── Header ── */}
        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* Nav */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
            <button
              onClick={onMenu}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-coach-menu"
            >
              <Swords size={14} />
              Main Menu
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl border border-white/20 dark:border-white/8">
              <Brain size={12} className="text-primary" />
              <span className="text-xs font-semibold text-primary">AI Coach Report</span>
            </div>
          </motion.div>

          {/* Verdict hero */}
          <motion.div
            variants={itemVariants}
            className="glass rounded-3xl p-6 text-center relative overflow-hidden"
          >
            {/* Decorative bg */}
            <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${grade.bg}`} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
              {/* Grade ring */}
              <div className="relative flex-shrink-0">
                <ScoreRing score={summary.performanceScore} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                    className={`text-4xl font-black ${grade.color}`}
                  >
                    {grade.label}
                  </motion.span>
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {Math.round(summary.performanceScore)}pts
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  {summary.playerWon
                    ? <Trophy size={18} className="text-amber-400" />
                    : <TrendingUp size={18} className="text-violet-400" />
                  }
                  <span className={`text-sm font-semibold ${summary.playerWon ? "text-amber-400" : "text-violet-400"}`}>
                    {summary.playerWon ? "Victory" : "Defeat"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 tracking-tight">
                  {grade.desc}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {summary.totalMoves} moves played · {summary.playerCaptures} capture{summary.playerCaptures !== 1 ? "s" : ""} made
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Stats grid ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <StatCard icon={Sword} label="Your captures" value={summary.playerCaptures}
              sub={`AI: ${summary.aiCaptures}`} color="bg-green-500" delay={0.25} />
            <StatCard icon={Crown} label="Kings crowned" value={summary.playerKingsPromoted}
              sub={`AI: ${summary.aiKingsPromoted}`} color="bg-amber-500" delay={0.3} />
            <StatCard icon={AlertTriangle} label="Missed captures" value={summary.missedCaptures}
              sub="Lower is better" color="bg-red-500" delay={0.35} />
            <StatCard icon={Zap} label="Chain combos" value={summary.multiJumps}
              sub="Multi-jumps" color="bg-violet-500" delay={0.4} />
          </motion.div>
        </motion.div>

        {/* ── Key Moments ── */}
        {playerMoments.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 26 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target size={13} className="text-muted-foreground" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Key Moments ({playerMoments.length})
              </h2>
            </div>
            <div className="space-y-2">
              {playerMoments.slice(0, 8).map((moment, i) => (
                <MomentRow key={`${moment.turn}-${moment.type}`} moment={moment} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Strategic Tips ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 26 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={13} className="text-primary" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Strategic Analysis
            </h2>
          </div>
          <div className="glass rounded-2xl overflow-hidden divide-y divide-border/40">
            {summary.tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.08, type: "spring", stiffness: 260, damping: 24 }}
                className="flex gap-3 px-4 py-3.5"
                data-testid={`coach-tip-${i}`}
              >
                <span className="text-base flex-shrink-0 mt-0.5" aria-hidden="true">
                  {TIP_EMOJIS[i % TIP_EMOJIS.length]}
                </span>
                <p className="text-sm text-foreground/90 leading-relaxed">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Comparison bar ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-5"
        >
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Piece Efficiency
          </h2>
          {[
            {
              label: "Your captures",
              value: summary.playerCaptures,
              max: 12,
              color: "bg-gradient-to-r from-rose-400 to-red-600",
            },
            {
              label: "AI captures",
              value: summary.aiCaptures,
              max: 12,
              color: "bg-gradient-to-r from-slate-400 to-slate-700",
            },
          ].map(({ label, value, max, color }) => (
            <div key={label} className="mb-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-bold text-foreground tabular-nums">{value}/12</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / max) * 100}%` }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.65 }}
                  className={`h-full rounded-full ${color}`}
                />
              </div>
            </div>
          ))}
        </motion.section>

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`
              flex-1 py-4 px-5 rounded-2xl font-semibold text-sm text-white
              flex items-center justify-center gap-2.5
              shadow-xl transition-opacity
              ${summary.playerWon
                ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/25"
                : "bg-gradient-to-r from-violet-600 to-purple-700 shadow-violet-500/25"
              }
            `}
            data-testid="button-coach-restart"
          >
            <RefreshCw size={15} />
            Play Again
            <ChevronRight size={15} className="opacity-60" />
          </motion.button>
          <motion.button
            onClick={onMenu}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="
              flex-1 py-4 px-5 rounded-2xl font-semibold text-sm
              glass border border-white/25 dark:border-white/10
              text-foreground hover:bg-muted/20
              flex items-center justify-center gap-2.5
              transition-all
            "
            data-testid="button-coach-menu"
          >
            <Swords size={15} />
            Main Menu
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
