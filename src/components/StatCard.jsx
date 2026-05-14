export default function StatCard({ label, value, icon: Icon, color = 'green', sub }) {
  const colorMap = {
    green:  { bg: 'bg-primary-50',  icon: 'text-primary-600',  val: 'text-primary-700' },
    blue:   { bg: 'bg-blue-50',     icon: 'text-blue-500',     val: 'text-blue-700' },
    orange: { bg: 'bg-orange-50',   icon: 'text-orange-500',   val: 'text-orange-700' },
    red:    { bg: 'bg-red-50',      icon: 'text-red-500',      val: 'text-red-700' },
    purple: { bg: 'bg-purple-50',   icon: 'text-purple-500',   val: 'text-purple-700' },
    teal:   { bg: 'bg-teal-50',     icon: 'text-teal-500',     val: 'text-teal-700' },
    yellow: { bg: 'bg-yellow-50',   icon: 'text-yellow-600',   val: 'text-yellow-700' },
    gray:   { bg: 'bg-gray-100',    icon: 'text-gray-500',     val: 'text-gray-700' },
  };

  const c = colorMap[color] || colorMap.green;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={c.icon} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${c.val} leading-tight`}>{value}</p>
        {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
