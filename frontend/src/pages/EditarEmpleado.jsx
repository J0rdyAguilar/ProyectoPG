import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "@/api/axios";
import { Save, ArrowLeft, UserCog } from "lucide-react";

export default function EditarEmpleado() {
  const { id } = useParams();
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
    // Para update del rol (el backend actualiza rol del usuario si se envía rol_id)
    rol_id: "",
    // Solo lectura / referencia
    usuario: { nombre: "", usuario: "" },
  });

  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setBusy(true);
        const [d, p, r, e] = await Promise.all([
          api.get("/dependencias"),
          api.get("/puestos"),
          api.get("/roles"),
          api.get(`/empleados/${id}`),
        ]);

        setDeps(d.data);
        setPuestos(p.data);
        setRoles(r.data);

        const emp = e.data;

        setF({
          nombre: emp.nombre || "",
          apellido: emp.apellido || "",
          numero_identificacion: emp.numero_identificacion || "",
          // Asegura formato YYYY-MM-DD para el input date
          fecha_nacimiento: (emp.fecha_nacimiento || "").slice(0, 10),
          numero_celular: emp.numero_celular || "",
          direccion: emp.direccion || "",
          dependencia_id: emp.dependencia_id || emp?.dependencia?.id || "",
          puesto_id: emp.puesto_id || emp?.puesto?.id || "",
          rol_id: emp?.usuario?.rol_id || emp?.usuario?.rol?.id || "",
          usuario: {
            nombre: emp?.usuario?.nombre || "",
            usuario: emp?.usuario?.usuario || "",
          },
        });
      } catch (e) {
        setErr("No se pudo cargar el empleado.");
      } finally {
        setBusy(false);
      }
    })();
  }, [id]);

  const on = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      setSaving(true);
      // El backend espera estos campos en update (más rol_id opcional)
      const payload = {
        nombre: f.nombre,
        apellido: f.apellido,
        numero_identificacion: f.numero_identificacion,
        fecha_nacimiento: f.fecha_nacimiento,
        numero_celular: f.numero_celular,
        direccion: f.direccion,
        dependencia_id: f.dependencia_id,
        puesto_id: f.puesto_id,
        rol_id: f.rol_id || null,
        USUARIO_MODIFICA: 1, // opcional, según tus columnas
      };

      await api.put(`/empleados/${id}`, payload);
      setOk("Cambios guardados correctamente");
      setTimeout(() => nav("/empleados", { replace: true }), 700);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Error al actualizar empleado";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 grid place-items-center">
            <UserCog size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Editar empleado</h1>
            <p className="text-gray-400 text-sm">Actualiza la información del colaborador.</p>
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

      {/* Form card */}
      <form onSubmit={submit} className="bg-card border border-soft rounded-2xl p-6 space-y-6">
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Datos del empleado</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre">
              <Input disabled={busy} value={f.nombre} onChange={(e) => on("nombre", e.target.value)} />
            </Field>
            <Field label="Apellido">
              <Input disabled={busy} value={f.apellido} onChange={(e) => on("apellido", e.target.value)} />
            </Field>

            <Field label="Identificación / DPI">
              <Input disabled={busy} value={f.numero_identificacion} onChange={(e) => on("numero_identificacion", e.target.value)} />
            </Field>
            <Field label="Fecha de nacimiento">
              <Input disabled={busy} type="date" value={f.fecha_nacimiento} onChange={(e) => on("fecha_nacimiento", e.target.value)} />
            </Field>

            <Field label="Celular">
              <Input disabled={busy} value={f.numero_celular} onChange={(e) => on("numero_celular", e.target.value)} />
            </Field>
            <Field label="Dirección" className="md:col-span-2">
              <Input disabled={busy} value={f.direccion} onChange={(e) => on("direccion", e.target.value)} />
            </Field>

            <Field label="Dependencia">
              <Select disabled={busy} value={f.dependencia_id} onChange={(e) => on("dependencia_id", e.target.value)}>
                <option value="">Selecciona una dependencia</option>
                {deps.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </Select>
            </Field>

            <Field label="Puesto">
              <Select disabled={busy} value={f.puesto_id} onChange={(e) => on("puesto_id", e.target.value)}>
                <option value="">Selecciona un puesto</option>
                {puestos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <hr className="border-soft" />

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Usuario del sistema</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre (persona)">
              <Input disabled value={f.usuario.nombre} />
            </Field>
            <Field label="Usuario (login)">
              <Input disabled value={f.usuario.usuario} />
            </Field>

            <Field label="Rol">
              <Select disabled={busy} value={f.rol_id} onChange={(e) => on("rol_id", e.target.value)}>
                <option value="">— sin cambios —</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </Select>
            </Field>
          </div>
          <p className="text-xs text-gray-500">
            * El cambio de rol se aplicará al usuario vinculado a este empleado.
          </p>
        </section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || busy}
            className="h-11 px-5 rounded-xl bg-primary text-white inline-flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Guardando..." : "Guardar cambios"}
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

/* ---------- helpers UI (mismos estilos que “Nuevo empleado”) ---------- */

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
