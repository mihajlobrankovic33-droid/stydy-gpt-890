import { Button } from "@/components/ui/button";
import { Lightbulb, FileText, HelpCircle, BookOpen, GraduationCap } from "lucide-react";

export type ActionType = "explain" | "summary" | "quiz" | "homework" | "exam";

interface QuickActionsProps {
  onAction: (action: ActionType, prompt: string) => void;
  disabled?: boolean;
}

const actions = [
  {
    type: "explain" as ActionType,
    label: "Explain Simply",
    icon: Lightbulb,
    prompt: "Please explain this topic in the simplest way possible, step by step:",
    color: "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30 hover:border-amber-500/50",
  },
  {
    type: "summary" as ActionType,
    label: "Create Summary",
    icon: FileText,
    prompt: "Please create a clear, organized summary of this topic:",
    color: "bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border-sky-500/30 hover:border-sky-500/50",
  },
  {
    type: "quiz" as ActionType,
    label: "Make a Quiz",
    icon: HelpCircle,
    prompt: "Please create a short quiz with 5 multiple-choice questions about:",
    color: "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30 hover:border-emerald-500/50",
  },
  {
    type: "homework" as ActionType,
    label: "Help with Homework",
    icon: BookOpen,
    prompt: "I need help with my homework. Please guide me through this problem:",
    color: "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border-violet-500/30 hover:border-violet-500/50",
  },
  {
    type: "exam" as ActionType,
    label: "Exam Mode",
    icon: GraduationCap,
    prompt: "I'm preparing for an exam. Please give me direct, clear answers:",
    color: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30 hover:border-red-500/50",
  },
];

export const QuickActions = ({ onAction, disabled }: QuickActionsProps) => {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
      {actions.map((action) => (
        <Button
          key={action.type}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.type, action.prompt)}
          disabled={disabled}
          className={`${action.color} border rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm`}
        >
          <action.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">{action.label}</span>
          <span className="xs:hidden">{action.label.split(" ")[0]}</span>
        </Button>
      ))}
    </div>
  );
};
