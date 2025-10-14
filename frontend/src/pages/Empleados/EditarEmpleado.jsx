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
  const [posiblesJefes, setPosiblesJefes] = useState([]);

  const [f, setF] = useState({
    nombre: "",
    apellido: "",
    numero_identificacion: "",
    fecha_nacimiento: "",
    numero_celular: "",
    direccion: "",
    genero: "",
    renglon_presupuestario: "",
    salario: "",
    dependencia_id: "",
    puesto_id: "",
    id_jefe: "",
    rol_id: "",
    usuario: { nombre: "", usuario: "" },
  });

  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // --- Carga puestos por dependencia ---
  const loadPuestosByDep = async (depId) => {
    if (!depId) {
      setPuestos([]);
      return;
    }
    try {
      const r = await api.get("/puestos", { params: { dependencia_id: depId } });
      if (Array.isArray(r.data)) {
        setPuestos(r.data);
        return;
      }
    } catch {}
    try {
      const rAll = await api.get("/puestos");
      const only = (rAll.data || []).filter(
        (p) =>
          String(p.dependencia_id) === String(depId) ||
          String(p?.dependencia?.id) === String(depId)
      );
      setPuestos(only);
    } catch {
      setPuestos([]);
    }
  };

  // --- Carga inicial ---
  useEffect(() => {
    (async () => {
      try {
        setBusy(true);
        const [d, r, e, j] = await Promise.all([
          api.get("/dependencias"),
          api.get("/roles"),
          api.get(`/empleados/${id}`),
          api.get(`/posibles-jefes/${id}`),
        ]);

        setDeps(d.data || []);
        setRoles(r.data || []);
        setPosiblesJefes(j.data || []);

        const emp = e.data || {};
        const depId = emp.dependencia_id ?? emp?.dependencia?.id ?? "";

        setF({
          nombre: emp.nombre || "",
          apellido: emp.apellido || "",
          numero_identificacion: emp.numero_identificacion || "",
          fecha_nacimiento: (emp.fecha_nacimiento || "").slice(0, 10),
          numero_celular: emp.numero_celular || "",
          direccion: emp.direccion || "",
          genero: emp.genero || "",
          renglon_presupuestario: emp.renglon_presupuestario || "",
          salario: emp.salario || "",
          dependencia_id: depId,
          puesto_id: emp.puesto_id ?? emp?.puesto?.id ?? "",
          id_jefe: emp.id_jefe || "",
          rol_id: emp?.usuario?.rol_id ?? emp?.usuario?.rol?.id ?? "",
          usuario: {
            nombre: emp?.usuario?.nombre || "",
            usuario: emp?.usuario?.usuario || "",
          },
        });

        await loadPuestosByDep(depId);
      } catch {
        setErr("No se pudo cargar el empleado.");
      } finally {
        setBusy(false);
      }
    })();
  }, [id]);

  // --- Si cambia la dependencia, limpia puesto y recarga ---
  useEffect(() => {
    const depId = f.dependencia_id;
    setF((s) => ({ ...s, puesto_id: "" }));
    loadPuestosByDep(depId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.dependencia_id]);

  const on = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      setSaving(true);
      const payload = {
        nombre: f.nombre,
        apellido: f.apellido,
        numero_identificacion: f.numero_identificacion,
        fecha_nacimiento: f.fecha_nacimiento,
        numero_celular: f.numero_celular,
        direccion: f.direccion,
        genero: f.genero,
        renglon_presupuestario: f.renglon_presupuestario,
        salario: f.salario,
        dependencia_id: f.dependencia_id || null,
        puesto_id: f.puesto_id || null,
        id_jefe: f.id_jefe || null,
        rol_id: f.rol_id || null,
        USUARIO_MODIFICA: 1,
      };

      await api.put(`/empleados/${id}`, payload);
      setOk("Cambios guardados correctamente");
      setTimeout(() => nav("/empleados", { replace: true }), 700);
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.response?.data?.error ||
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
          <div className="w-10 h-10 rounded-xl2 bg-primary text-white grid place-items-center">
            <UserCog size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Editar empleado</h1>
            <p className="text-ink-muted text-sm">
              Actualiza la información del colaborador.
            </p>
          </div>
        </div>

        <Link to="/empleados" className="btn-ghost inline-flex h-10 items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>

      {/* Alerts */}
      {err && <div className="card p-3 border-red-200 bg-red-50 text-red-700">{err}</div>}
      {ok && <div className="card p-3 border-emerald-200 bg-emerald-50 text-emerald-700">{ok}</div>}

      {/* Form */}
      <form onSubmit={submit} className="card p-6 space-y-6">
        {/* Datos del empleado */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Datos del empleado</h2>

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
              <Input type="date" disabled={busy} value={f.fecha_nacimiento} onChange={(e) => on("fecha_nacimiento", e.target.value)} />
            </Field>

            <Field label="Celular">
              <Input disabled={busy} value={f.numero_celular} onChange={(e) => on("numero_celular", e.target.value)} />
            </Field>

            <Field label="Dirección" className="md:col-span-2">
              <Textarea disabled={busy} rows={2} value={f.direccion} onChange={(e) => on("direccion", e.target.value)} />
            </Field>

            {/* Género */}
            <Field label="Género">
              <Select
                disabled={busy}
                value={f.genero}
                onChange={(e) => on("genero", e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </Select>
            </Field>

            {/* Renglón presupuestario */}
            <Field label="Renglón presupuestario">
              <Input
                disabled={busy}
                value={f.renglon_presupuestario}
                onChange={(e) => on("renglon_presupuestario", e.target.value)}
                placeholder="Ej. 011"
              />
            </Field>

            {/* Salario */}
            <Field label="Salario (Q)">
              <Input
                type="number"
                step="0.01"
                min="0"
                disabled={busy}
                value={f.salario}
                onChange={(e) => on("salario", e.target.value)}
                placeholder="Ej. 3500.00"
              />
            </Field>

            {/* Dependencia */}
            <Field label="Dependencia">
              <Select
                disabled={busy}
                value={f.dependencia_id}
                onChange={(e) => on("dependencia_id", e.target.value)}
              >
                <option value="">Selecciona una dependencia</option>
                {deps.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </Select>
            </Field>

            {/* Puesto */}
            <Field label="Puesto">
              <Select
                disabled={busy || !f.dependencia_id}
                value={f.puesto_id}
                onChange={(e) => on("puesto_id", e.target.value)}
              >
                <option value="">
                  {!f.dependencia_id
                    ? "Selecciona una dependencia primero"
                    : puestos.length
                      ? "Selecciona un puesto"
                      : "No hay puestos para esta dependencia"}
                </option>
                {puestos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </Select>
            </Field>

            <Field label="Jefe inmediato" className="md:col-span-2">
              <Select
                disabled={busy}
                value={f.id_jefe}
                onChange={(e) => on("id_jefe", e.target.value)}
              >
                <option value="">Sin jefe asignado</option>
                {posiblesJefes.map((jefe) => (
                  <option key={jefe.id} value={jefe.id}>
                    {jefe.nombre_completo}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <hr className="border-soft" />

        {/* Usuario del sistema */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Usuario del sistema</h2>

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

          <p className="text-xs text-ink-muted">
            * El cambio de rol se aplicará al usuario vinculado a este empleado.
          </p>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || busy}
            className="btn-primary inline-flex items-center gap-2 h-11"
          >
            <Save size={18} />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          <Link to="/empleados" className="btn-ghost h-11 inline-flex items-center gap-2">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ---------- Helpers UI ---------- */
function Field({ label, className = "", children }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
function Input({ className = "", ...props }) {
  return <input {...props} className={`input ${className}`} />;
}
function Textarea({ className = "", ...props }) {
  return <textarea {...props} className={`textarea ${className}`} />;
}
function Select({ className = "", ...props }) {
  return <select {...props} className={`select ${className}`} />;
}