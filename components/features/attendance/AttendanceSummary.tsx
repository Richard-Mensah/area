import { UserCheck, UserX, Clock, Users } from "lucide-react"

type Props = {
  present: number
  absent: number
  late: number
  total: number
}

export default function AttendanceSummary({ present, absent, late, total }: Props) {
  const cards = [
    { label: "Present",  value: present, icon: UserCheck, color: "text-green-600", bg: "bg-green-50"  },
    { label: "Absent",   value: absent,  icon: UserX,     color: "text-red-600",   bg: "bg-red-50"    },
    { label: "Late",     value: late,    icon: Clock,     color: "text-yellow-600",bg: "bg-yellow-50" },
    { label: "Total",    value: total,   icon: Users,     color: "text-blue-600",  bg: "bg-blue-50"   },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
