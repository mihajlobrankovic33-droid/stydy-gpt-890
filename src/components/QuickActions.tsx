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
    color: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
  },
  {
    type: "summary" as ActionType,
    label: "Create Summary",
    icon: FileText,
    prompt: "Please create a clear, organized summary of this topic:",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
  },
  {
    type: "quiz" as ActionType,
    label: "Make a Quiz",
    icon: HelpCircle,
    prompt: "Please create a short quiz with 5 multiple-choice questions about:",
    color: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
  },
  {
    type: "homework" as ActionType,
    label: "Help with Homework",
    icon: BookOpen,
    prompt: "I need help with my homework. Please guide me through this problem:",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
  },
  {
    type: "exam" as ActionType,
    label: "Exam Mode",
    icon: GraduationCap,
    prompt: "I'm preparing for an exam. Please give me direct, clear answers:",
    color: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
  },
];

export const QuickActions = ({ onAction, disabled }: QuickActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {actions.map((action) => (
        <Button
          key={action.type}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.type, action.prompt)}
          disabled={disabled}
          className={`${action.color} border rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95`}
        >
          <action.icon className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};
