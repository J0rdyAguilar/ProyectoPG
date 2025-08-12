// src/pages/NuevaEmpleado.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/api/axios";
import { UserPlus, Save, ArrowLeft } from "lucide-react";

export default function NuevaEmpleado() {
  const nav = useNavigate();

  const [deps, setDeps] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [roles, setRoles] = useState([]);

  const [f, setF] = useState({
    nombre: "",
    apellido: "",
    numero_identificacion: "",
    fecha_nacimiento: "",
    numero_celular: "",
    direccion: "",
    dependencia_id: "",
    puesto_id: "",
    usuario: { nombre: "", usuario: "", contrasena: "", rol_id: "" },
  });

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setBusy(true);
    Promise.all([api.get("/dependencias"), api.get("/puestos"), api.get("/roles")])
      .then(([d, p, r]) => {
        setDeps(d.data);
        setPuestos(p.data);
        setRoles(r.data);
      })
      .catch(() => setErr("No se pudieron cargar los catálogos."))
      .finally(() => setBusy(false));
  }, []);

  const on = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const onU = (k, v) =>
    setF((s) => ({ ...s, usuario: { ...s.usuario, [k]: v } }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      setLoading(true);
      await api.post("/empleados", { ...f, USUARIO_INGRESO: 1 });
      setOk("Empleado creado con éxito");
      setTimeout(() => nav("/empleados", { replace: true }), 700);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.response?.data?.error || "Error al crear empleado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 grid place-items-center">
            <UserPlus size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Registrar nuevo empleado</h1>
            <p className="text-gray-400 text-sm">
              Completa los datos del colaborador y su usuario de acceso.
            </p>
          </div>
        </div>

        <Link
          to="/empleados"
          className="h-10 px-4 rounded-xl bg-soft hover:bg-soft/80 text-sm inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>

      {/* Alerts */}
      {err && (
        <div className="border border-rose-500/30 bg-rose-500/10 text-rose-200 px-4 py-2 rounded-xl">
          {err}
        </div>
      )}
      {ok && (
        <div className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 px-4 py-2 rounded-xl">
          {ok}
        </div>
      )}

      {/* Card */}
      <form onSubmit={submit} className="bg-card border border-soft rounded-2xl p-6 space-y-6">
        {/* Datos del empleado */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Datos del empleado</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre">
              <Input value={f.nombre} onChange={(e) => on("nombre", e.target.value)} />
            </Field>
            <Field label="Apellido">
              <Input value={f.apellido} onChange={(e) => on("apellido", e.target.value)} />
            </Field>

            <Field label="Identificación / DPI">
              <Input value={f.numero_identificacion} onChange={(e) => on("numero_identificacion", e.target.value)} />
            </Field>
            <Field label="Fecha de nacimiento">
              <Input type="date" value={f.fecha_nacimiento} onChange={(e) => on("fecha_nacimiento", e.target.value)} />
            </Field>

            <Field label="Celular">
              <Input value={f.numero_celular} onChange={(e) => on("numero_celular", e.target.value)} />
            </Field>
            <Field label="Dirección" className="md:col-span-2">
              <Input value={f.direccion} onChange={(e) => on("direccion", e.target.value)} />
            </Field>

            <Field label="Dependencia">
              <Select
                value={f.dependencia_id}
                onChange={(e) => on("dependencia_id", e.target.value)}
                disabled={busy}
              >
                <option value="">Selecciona una dependencia</option>
                {deps.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </Select>
            </Field>

            <Field label="Puesto">
              <Select
                value={f.puesto_id}
                onChange={(e) => on("puesto_id", e.target.value)}
                disabled={busy}
              >
                <option value="">Selecciona un puesto</option>
                {puestos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <hr className="border-soft" />

        {/* Datos del usuario */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Datos del usuario</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre (persona)">
              <Input
                value={f.usuario.nombre}
                onChange={(e) => onU("nombre", e.target.value)}
              />
            </Field>
            <Field label="Usuario (login)">
              <Input
                value={f.usuario.usuario}
                onChange={(e) => onU("usuario", e.target.value)}
              />
            </Field>

            <Field label="Contraseña">
              <Input
                type="password"
                value={f.usuario.contrasena}
                onChange={(e) => onU("contrasena", e.target.value)}
              />
            </Field>

            <Field label="Rol">
              <Select
                value={f.usuario.rol_id}
                onChange={(e) => onU("rol_id", e.target.value)}
                disabled={busy}
              >
                <option value="">Selecciona un rol</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-11 px-5 rounded-xl bg-primary text-white inline-flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60"
          >
            <Save size={18} />
            {loading ? "Guardando..." : "Guardar"}
          </button>

          <Link
            to="/empleados"
            className="h-11 px-5 rounded-xl bg-soft inline-flex items-center hover:bg-soft/80"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ---------- pequeños helpers de UI ---------- */

function Field({ label, className = "", children }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`h-11 px-3 rounded-xl bg-[#0b1220] border border-soft outline-none focus:border-primary/60 ${props.className || ""}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`h-11 px-3 rounded-xl bg-[#0b1220] border border-soft outline-none focus:border-primary/60 ${props.className || ""}`}
    />
  );
}
