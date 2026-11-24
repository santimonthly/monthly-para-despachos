// Plantillas base de los 3 correos, tal como venían en el prototipo (window.MD_TPL).
// Las imágenes se referencian con {{assets_url}}/<archivo>.png y viven en public/email-assets.
// Se editan desde el panel (la tabla plantillas guarda los cambios encima de estas).
import type { PlantillaBase } from "./tipos.ts";

export const PLANTILLAS_BASE: PlantillaBase[] = [
  {
    dia: 0,
    angulo: "Activar el beneficio",
    asunto: "{{despacho_corto}} - Activa tu nuevo beneficio para {{anio}}",
    pre: "Como cliente de {{despacho_corto}} tienes un mes sin costo para ver los números reales de {{empresa}}.",
    html: `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>{{asunto}}</title>
<link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Titillium+Web:wght@400;600&display=swap" rel="stylesheet">
<style>
body{margin:0;padding:0;background:#EEF0F7;-webkit-text-size-adjust:100%;}
table{border-collapse:collapse;}
img{border:0;display:block;outline:none;text-decoration:none;}
a{text-decoration:none;}
.t{font-family:'Titillium Web',Arial,Helvetica,sans-serif;}
.p{font-family:'PT Sans',Arial,Helvetica,sans-serif;}
@media only screen and (max-width:620px){
.wrap{width:100% !important;}
.px{padding-left:24px !important;padding-right:24px !important;}
.col{display:block !important;width:100% !important;box-sizing:border-box !important;}
.px2{padding-left:16px !important;padding-right:16px !important;}
.hero-txt{padding:36px 24px 0 24px !important;text-align:center !important;}
.hero-img{text-align:center !important;padding:18px 16px 14px 16px !important;}
.hero-img img{width:210px !important;}
.hero-tag{margin-top:18px !important;font-size:27px !important;}
.hero-logo{width:88px !important;}
.hide-m{display:none !important;}
.show-m{display:inline !important;}
.mc{margin-left:auto !important;margin-right:auto !important;}
.mimg{margin-left:auto !important;margin-right:auto !important;display:block !important;}
.strip-l{padding:8px 0 8px 16px !important;}
.strip-r{padding:8px 14px 8px 4px !important;}
.strip-ico{padding-right:10px !important;}
.strip-img{width:30px !important;height:30px !important;}
.strip-q{font-size:14px !important;}
.strip-btn{padding:6px 13px !important;font-size:13px !important;}
.off-l{padding:24px 18px 0 18px !important;}
.off-1{padding:22px 16px 20px 16px !important;}
.vale-l{width:104px !important;padding:18px 8px !important;}
.vale-l img{width:62px !important;}
.vale-r{padding:16px 14px !important;}
.vale-tit{font-size:23px !important;}
.off-1 .t{font-size:24px !important;}
.off-div{border-right:0 !important;border-bottom:2px dashed #DDE2FF !important;padding:0 0 16px 0 !important;}
.off-r{padding:16px 20px 22px 20px !important;text-align:center !important;}
.sm-img{padding:22px 0 0 0 !important;text-align:center !important;}
.sm-txt{padding:14px 22px 24px 22px !important;text-align:center !important;}
.sm-txt img{margin:0 auto !important;}
.col-txt{padding:26px 22px 4px 22px !important;}
.cards-wrap{padding:12px 14px 4px 14px !important;}
}
</style>
<!--[if mso]><style>.t,.p{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#EEF0F7;">

<!-- Preheader (texto que se ve en la bandeja) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EEF0F7;">{{preheader}}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F7;">
<tr><td align="center" style="padding:32px 12px;">

<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

<!-- ============ HERO ============ -->
<tr><td bgcolor="#3F55F8" style="background:#3F55F8;background-image:linear-gradient(130deg,#5366FF 0%,#283FF3 62%,#1414FF 120%);border-radius:24px 24px 0 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td class="col hero-txt" valign="middle" width="300" style="width:300px;padding:56px 0 56px 44px;">
<table role="presentation" class="mc" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><img class="hero-logo" src="{{assets_url}}/monthly-white.png" width="96" alt="monthly" style="width:96px;height:auto;display:block;"></td>
<td valign="middle" style="padding:0 10px;"><div style="width:1px;height:16px;background:#8E9BFF;font-size:0;line-height:0;">&nbsp;</div></td>
<td valign="middle" class="p" style="font-size:13px;line-height:1.2;color:#C9D1FF;white-space:nowrap;">Plataforma de finanzas con IA</td>
</tr></table>
<p class="t hero-tag" style="margin:22px 0 0 0;font-size:30px;line-height:1.15;font-weight:600;color:#FFFFFF;">Tus números reales,<br><span style="color:#C8F7E6;">todos los</span> <span style="color:#10E8A0;">meses.</span></p>
</td>
<td class="col hero-img" valign="middle" align="center" width="256" style="width:256px;padding:44px 20px 24px 4px;font-size:0;line-height:0;">
<img src="{{assets_url}}/monthly-plataforma.png" width="232" alt="Plataforma de Monthly" style="width:232px;max-width:100%;height:auto;display:inline-block;">
</td>
</tr>
</table>
</td></tr>

<!-- ============ FRANJA (pegada al encabezado) ============ -->
<tr><td bgcolor="{{despacho_color}}" style="background:{{despacho_color}};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td class="strip-l" valign="middle" style="padding:8px 0 8px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" class="p strip-q" style="font-size:14.5px;line-height:1.25;color:{{despacho_color_texto}};padding-right:10px;white-space:nowrap;"><span class="hide-m">Te presentamos, en</span><span class="show-m" style="display:none;mso-hide:all;">En</span> alianza con</td>
<td valign="middle"><img src="{{despacho_logo_url}}" width="50" alt="{{despacho_nombre}}" style="width:50px;height:auto;border-radius:3px;"></td>
</tr></table>
</td>
<td class="strip-r" valign="middle" align="right" style="padding:8px 32px 8px 8px;white-space:nowrap;">
<table role="presentation" cellpadding="0" cellspacing="0" align="right" style="border-collapse:separate;"><tr><td bgcolor="#10E8A0" style="background:#10E8A0;background-image:linear-gradient(100deg,#8C9BFF 0%,#5366FF 35%,#10E8A0 70%,#5366FF 100%);border-radius:999px;padding:1.5px;box-shadow:0 2px 14px rgba(16,232,160,.45);">
<a href="https://monthly-empezamos.netlify.app/" target="_blank" class="t strip-btn" style="display:inline-block;background:#5366FF;color:#FFFFFF;padding:6px 16px 6px 18px;border-radius:999px;font-size:14px;font-weight:600;white-space:nowrap;">Conocer Monthly&nbsp;&nbsp;&rarr;</a>
</td></tr></table>
</td>
</tr>
</table>
</td></tr>

<!-- ============ INTRO ============ -->
<tr><td bgcolor="#FFFFFF" class="px p" style="background:#FFFFFF;padding:40px 48px 8px 48px;font-size:17px;line-height:1.65;color:#3F467E;">
<p style="margin:0 0 16px 0;">Hola, {{contacto_nombre}}:</p>
<p style="margin:0 0 16px 0;">{{frase_temporada}}, en <strong style="color:#2D3590;">{{despacho_nombre}}</strong> queremos que, además de tener tu contabilidad en orden, sepas cómo le va a tu empresa mes con mes y tomes mejores decisiones desde enero. Por eso hicimos una alianza con <strong style="color:#2D3590;">Monthly</strong>.</p>
<p style="margin:0 0 16px 0;"><a href="https://monthly.la/" target="_blank" style="color:#2D3590;text-decoration:underline;text-decoration-color:#B9C3FF;"><strong style="color:#2D3590;">Monthly</strong></a> es una plataforma de finanzas con IA pensada para directores de empresas. La utilizan +200 empresas en México para analizar sus estados financieros, monitorear su valuación y tomar decisiones estratégicas, cada mes.</p>
<p style="margin:0;">Nosotros seguimos siendo tus contadores de siempre. Monthly se conecta al sistema contable que ya usamos en el despacho y entre ambos equipos coordinamos tu información: tú no haces trabajo extra.</p>
</td></tr>

<!-- ============ MONTHLY ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:28px 32px 8px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F5FF;border-radius:20px;">
<tr><td class="col-txt" style="padding:28px 28px 4px 28px;">
<p class="t" style="margin:0;font-size:22px;line-height:1.25;font-weight:600;color:#2D3590;">¿Qué ganas con <img src="{{assets_url}}/monthly-blue.png" width="100" alt="Monthly" style="width:100px;height:auto;display:inline-block;vertical-align:-4px;margin:0 1px 0 3px;">?</p>
<p class="p" style="margin:8px 0 0 0;font-size:15.5px;line-height:1.55;color:#3F467E;">Tus números al día, 24 horas después de cada cierre.</p>
</td></tr>
<tr><td class="cards-wrap" style="padding:14px 16px 4px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td class="col card" width="33%" valign="top" height="100%" style="padding:4px;height:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" height="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px;border-collapse:separate;height:100%;"><tr><td class="p" valign="top" style="padding:16px 14px 18px 14px;font-size:14px;line-height:1.45;color:#6A7392;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="36" height="36" align="center" valign="middle" bgcolor="#EEF0FF" style="width:36px;height:36px;background:#EEF0FF;border-radius:10px;font-size:18px;line-height:36px;">💡</td></tr></table>
<p class="t" style="margin:12px 0 4px 0;font-size:15.5px;line-height:1.25;font-weight:600;color:#2D3590;">Números reales</p>
Cómo le va de verdad a tu empresa.
</td></tr></table>
</td><td class="col card" width="34%" valign="top" height="100%" style="padding:4px;height:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" height="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px;border-collapse:separate;height:100%;"><tr><td class="p" valign="top" style="padding:16px 14px 18px 14px;font-size:14px;line-height:1.45;color:#6A7392;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="36" height="36" align="center" valign="middle" bgcolor="#EEF0FF" style="width:36px;height:36px;background:#EEF0FF;border-radius:10px;font-size:18px;line-height:36px;">🎯</td></tr></table>
<p class="t" style="margin:12px 0 4px 0;font-size:15.5px;line-height:1.25;font-weight:600;color:#2D3590;">Decide a tiempo</p>
Qué cambió en el mes y por qué, al cierre.
</td></tr></table>
</td><td class="col card" width="33%" valign="top" height="100%" style="padding:4px;height:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" height="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px;border-collapse:separate;height:100%;"><tr><td class="p" valign="top" style="padding:16px 14px 18px 14px;font-size:14px;line-height:1.45;color:#6A7392;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="36" height="36" align="center" valign="middle" bgcolor="#EEF0FF" style="width:36px;height:36px;background:#EEF0FF;border-radius:10px;font-size:18px;line-height:36px;">⚡</td></tr></table>
<p class="t" style="margin:12px 0 4px 0;font-size:15.5px;line-height:1.25;font-weight:600;color:#2D3590;">Cero trabajo extra</p>
Toma tu contabilidad. Tú no capturas nada.
</td></tr></table>
</td>
</tr></table></td></tr>
<tr><td class="col-txt" style="padding:22px 28px 4px 28px;">
<p class="t" style="margin:0;font-size:18px;line-height:1.25;font-weight:600;color:#2D3590;">Qué incluye</p>
<p class="p" style="margin:6px 0 0 0;font-size:15px;line-height:1.55;color:#3F467E;">Todo en una sola plataforma, con acceso para ti y tu equipo.</p>
</td></tr>
<tr><td style="padding:6px 26px 4px 26px;">
<p class="t" style="margin:18px 0 8px 2px;font-size:16px;font-weight:600;color:#2D3590;">Tu plataforma</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px;">
<tr><td style="padding:6px 18px 6px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="top" width="34" style="padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">📊</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Estados financieros</span><br>Resultados, balance y flujo, mes a mes.</td></tr><tr><td valign="top" width="34" style="padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">📈</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Más de 50 métricas</span><br>Rentabilidad, liquidez, solvencia y eficiencia.</td></tr><tr><td valign="top" width="34" style="padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">💎</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Valuación</span><br>Cuánto vale tu empresa, mes a mes.</td></tr><tr><td valign="top" width="34" style="padding:10px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">💰</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Ahorros potenciales</span><br>Dónde puede gastar menos tu empresa.</td></tr></table>
</td></tr></table>
<p class="t" style="margin:18px 0 8px 2px;font-size:16px;font-weight:600;color:#2D3590;">Con inteligencia artificial</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px;">
<tr><td style="padding:6px 18px 6px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="top" width="34" style="padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">✨</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">AskMara</span><br>Pregúntale a tus números en español.</td></tr><tr><td valign="top" width="34" style="padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">✉️</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">MailMara</span><br>Recibe cada mes un correo con el resumen de tu cierre.</td></tr><tr><td valign="top" width="34" style="padding:10px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">🏷️</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Categorizador con IA</span><br>Ordena cada cuenta en su categoría, según tu industria.</td></tr></table>
</td></tr></table>
</td></tr>
<tr><td class="col-txt p" style="padding:14px 28px 24px 28px;font-size:14px;line-height:1.5;color:#6A7392;">Funciona con CONTPAQi, Microsip, Contalink y otros sistemas contables.</td></tr>
</table>
</td></tr>

<!-- ============ COMO EMPIEZAS ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:28px 32px 8px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td class="col-txt" style="padding:0 6px 4px 6px;">
<p class="t" style="margin:0;font-size:22px;line-height:1.25;font-weight:600;color:#2D3590;">Cómo empiezas</p>
<p class="p" style="margin:8px 0 0 0;font-size:15.5px;line-height:1.55;color:#3F467E;">Sin papeleo y sin cambiar nada de lo que ya haces con nosotros.</p>
</td></tr>
<tr><td style="padding:8px 6px 0 6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="top" width="34" style="width:34px;min-width:34px;padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#283FF3" class="p" style="width:30px;height:30px;background:#283FF3;border-radius:999px;font-size:15px;line-height:30px;font-weight:700;color:#FFFFFF;">1</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Respondes este correo</span><br>Con eso activamos tu beneficio.</td></tr><tr><td valign="top" width="34" style="width:34px;min-width:34px;padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#283FF3" class="p" style="width:30px;height:30px;background:#283FF3;border-radius:999px;font-size:15px;line-height:30px;font-weight:700;color:#FFFFFF;">2</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Conectamos tu contabilidad</span><br>Monthly se conecta a nuestro sistema y coordinamos todo entre ambos equipos.<br><span style="display:inline-block;height:26px;margin:10px 16px 0 0;white-space:nowrap;vertical-align:top;"><img src="{{assets_url}}/sys-contpaqi.png" width="26" height="26" alt="" style="width:26px;height:26px;display:inline-block;vertical-align:top;"><span style="display:inline-block;vertical-align:top;margin-left:7px;font-size:13.5px;line-height:26px;color:#6A7392;">CONTPAQi</span></span><span style="display:inline-block;height:26px;margin:10px 16px 0 0;white-space:nowrap;vertical-align:top;"><img src="{{assets_url}}/sys-microsip.png" width="26" height="26" alt="" style="width:26px;height:26px;display:inline-block;vertical-align:top;"><span style="display:inline-block;vertical-align:top;margin-left:7px;font-size:13.5px;line-height:26px;color:#6A7392;">Microsip</span></span><span style="display:inline-block;height:26px;margin:10px 16px 0 0;white-space:nowrap;vertical-align:top;"><img src="{{assets_url}}/sys-contalink.png" width="26" height="26" alt="" style="width:26px;height:26px;display:inline-block;vertical-align:top;"><span style="display:inline-block;vertical-align:top;margin-left:7px;font-size:13.5px;line-height:26px;color:#6A7392;">Contalink</span></span><span style="display:inline-block;vertical-align:top;margin-top:10px;font-size:13.5px;line-height:26px;color:#9AA1AB;">y más</span></td></tr><tr><td valign="top" width="34" style="width:34px;min-width:34px;padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#283FF3" class="p" style="width:30px;height:30px;background:#283FF3;border-radius:999px;font-size:15px;line-height:30px;font-weight:700;color:#FFFFFF;">3</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Recibes tu plataforma lista</span><br>El equipo de Monthly la configura y arranca tu primer mes gratis.</td></tr><tr><td valign="top" width="34" style="width:34px;min-width:34px;padding:10px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#283FF3" class="p" style="width:30px;height:30px;background:#283FF3;border-radius:999px;font-size:15px;line-height:30px;font-weight:700;color:#FFFFFF;">4</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Tú decides si continúas</span><br>Si te sirve, sigues con el precio preferente de {{precio}} + IVA al mes.</td></tr></table>
</td></tr>
</table>
</td></tr>

<!-- ============ CIERRE ============ -->
<tr><td bgcolor="#FFFFFF" class="px p" style="background:#FFFFFF;padding:36px 48px 0 48px;font-size:16.5px;line-height:1.6;color:#3F467E;text-align:left;" align="left">
<p class="t" style="margin:0;font-size:21px;line-height:1.3;font-weight:600;color:#2D3590;">Entiende los números de tu empresa cada mes</p>
<p style="margin:10px 0 0 0;">Estamos convencidos de que Monthly te va a ayudar a entender y hacer crecer tu empresa.</p>
</td></tr>

<!-- ============ OFERTA ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:24px 32px 16px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;"><tr><td bgcolor="#5366FF" style="background:#5366FF;background-image:linear-gradient(100deg,#8C9BFF 0%,#5366FF 35%,#10E8A0 70%,#5366FF 100%);border-radius:22px;padding:2px;box-shadow:0 4px 22px rgba(16,232,160,.30);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
<tr>
<td class="vale-l" width="150" align="center" valign="middle" bgcolor="{{despacho_color}}" style="width:150px;background:{{despacho_color}};border-radius:20px 0 0 20px;padding:22px 12px;text-align:center;">
<p style="margin:0;font-size:34px;line-height:1;">&#127873;</p>
<img src="{{despacho_logo_url}}" width="78" alt="{{despacho_nombre}}" style="width:78px;height:auto;display:block;margin:14px auto 0 auto;border-radius:3px;">
<p class="p" style="margin:8px 0 0 0;font-size:12.5px;line-height:1.3;color:{{despacho_color_tenue}};">Exclusivo clientes</p>
</td>
<td class="vale-r" valign="middle" bgcolor="#FFFFFF" style="background:#FFFFFF;border-left:2px dashed #C9D1FF;border-radius:0 20px 20px 0;padding:20px 22px;">
<p class="t vale-tit" style="margin:0;font-size:27px;line-height:1.1;font-weight:600;color:#283FF3;">1er mes gratis.</p>
<p class="p" style="margin:6px 0 0 0;font-size:14px;line-height:20px;color:#3F467E;">Prueba <img src="{{assets_url}}/monthly-blue.png" width="68" alt="Monthly" style="width:68px;height:auto;display:inline-block;vertical-align:-3px;margin:0 2px;"> sin compromiso.</p>
<p class="p" style="margin:14px 0 0 0;font-size:13px;line-height:1.3;color:#6A7392;">Después</p>
<p class="p" style="margin:2px 0 0 0;font-size:13px;line-height:1.6;color:#6A7392;"><span style="font-size:22px;font-weight:700;color:#2D3590;white-space:nowrap;">{{precio}}</span>&nbsp; <span style="white-space:nowrap;">+ IVA/mes</span>&nbsp; <span style="color:#9AA1AB;text-decoration:line-through;">{{precio_original}}</span>&nbsp; <span style="display:inline-block;border:1px solid #9BDCC9;background:#E3F5EF;border-radius:999px;padding:1px 10px;font-size:12.5px;line-height:1.5;color:#2D3590;white-space:nowrap;">{{descuento}} OFF</span></p>
</td>
</tr>
</table>
</td></tr></table>

</td></tr>

<!-- ============ SABER MAS (cápsula con ilustración) ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:28px 32px 8px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F3F5FF" style="background:#F3F5FF;border-radius:20px;border-collapse:separate;">
<tr>
<td class="col sm-img" width="190" align="center" valign="middle" style="width:190px;padding:20px 0 20px 20px;font-size:0;line-height:0;">
<img src="{{assets_url}}/monthly-plataforma.png" width="170" alt="Plataforma de Monthly" style="width:170px;height:auto;display:inline-block;">
</td>
<td class="col sm-txt" valign="middle" style="padding:22px 26px 22px 18px;">
<img src="{{assets_url}}/monthly-blue.png" width="110" alt="monthly" style="width:110px;height:auto;display:block;">
<p class="p" style="margin:10px 0 0 0;font-size:15.5px;line-height:1.55;color:#3F467E;">Conoce la plataforma, sus módulos y cómo funciona.</p>
<table role="presentation" class="mc" cellpadding="0" cellspacing="0" style="margin-top:16px;border-collapse:separate;"><tr>
<td bgcolor="#283FF3" style="background:#283FF3;background-image:linear-gradient(130deg,#5366FF 0%,#283FF3 62%,#1414FF 120%);border-radius:999px;">
<a href="https://monthly-empezamos.netlify.app/" target="_blank" class="t" style="display:inline-block;padding:11px 22px;font-size:15.5px;font-weight:600;color:#FFFFFF;border-radius:999px;">Saber más</a>
</td>
</tr></table>
</td>
</tr>
</table>
</td></tr>

<!-- ============ CTA RESPONDER ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:28px 32px 0 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;"><tr>
<td bgcolor="#3346F5" style="background:#3346F5;background-image:linear-gradient(130deg,#5366FF 0%,#283FF3 62%,#1414FF 120%);border-radius:20px;padding:14px 22px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" width="36" style="padding-right:12px;"><img src="{{assets_url}}/icon-responder.png" width="36" height="36" alt="" style="width:36px;height:36px;display:block;"></td>
<td valign="middle"><p class="t" style="margin:0;font-size:16.5px;line-height:1.25;font-weight:600;color:#FFFFFF;">Responde este correo</p>
<p class="p" style="margin:2px 0 0 0;font-size:13.5px;line-height:1.3;color:#DCE1FF;">y activamos tu primer mes gratis</p></td>
</tr></table>
</td>
</tr></table>
</td></tr>

<!-- ============ FIRMA ============ -->
<tr><td bgcolor="#FFFFFF" class="px p" align="center" style="background:#FFFFFF;padding:28px 48px 0 48px;font-size:15px;line-height:1.5;color:#6A7392;text-align:center;">
<span class="t" style="font-size:16px;font-weight:600;color:#2D3590;">{{firma_nombre}}</span><br>{{despacho_nombre}} · <a href="{{despacho_sitio_web}}" target="_blank" style="color:#6A7392;text-decoration:underline;">{{despacho_sitio_texto}}</a>
</td></tr>

<!-- cierre de la tarjeta -->
<tr><td bgcolor="#FFFFFF" height="36" style="background:#FFFFFF;height:36px;font-size:0;line-height:0;border-radius:0 0 24px 24px;">&nbsp;</td></tr>

<!-- ============ FOOTER ============ -->
<tr><td align="center" style="padding:30px 24px 8px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><img src="{{assets_url}}/monthly-blue.png" width="84" alt="monthly" style="width:84px;height:auto;"></td>
<td valign="middle" class="t" style="padding:0 12px;font-size:16px;color:#9AA1AB;">×</td>
<td valign="middle"><img src="{{despacho_logo_url}}" width="56" alt="{{despacho_nombre}}" style="width:56px;height:auto;border-radius:3px;"></td>
</tr></table>
</td></tr>
<tr><td align="center" class="p" style="padding:12px 40px 36px 40px;font-size:12.5px;line-height:1.6;color:#9AA1AB;">
Precio preferente para clientes de {{despacho_nombre}}: {{precio}} + IVA al mes por empresa (precio original {{precio_original}} + IVA). El primer mes es sin costo. Aplican términos y condiciones.<br>
Las cifras de la ilustración son ilustrativas.<br><br>
<a href="{{enlace_baja}}" style="color:#9AA1AB;text-decoration:underline;">Darme de baja</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`,
  },
  {
    dia: 4,
    angulo: "Una pregunta que le importa al director",
    asunto: "¿Cuánto ganó {{empresa}} el mes pasado?",
    pre: "Con tu beneficio de {{despacho_corto}} lo ves 24 horas después de cada cierre, sin trabajo extra.",
    html: `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>{{asunto}}</title>
<link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Titillium+Web:wght@400;600&display=swap" rel="stylesheet">
<style>
body{margin:0;padding:0;background:#EEF0F7;-webkit-text-size-adjust:100%;}
table{border-collapse:collapse;}
img{border:0;display:block;outline:none;text-decoration:none;}
a{text-decoration:none;}
.t{font-family:'Titillium Web',Arial,Helvetica,sans-serif;}
.p{font-family:'PT Sans',Arial,Helvetica,sans-serif;}
@media only screen and (max-width:620px){
.wrap{width:100% !important;}
.px{padding-left:24px !important;padding-right:24px !important;}
.col{display:block !important;width:100% !important;box-sizing:border-box !important;}
.px2{padding-left:16px !important;padding-right:16px !important;}
.hero-txt{padding:36px 24px 0 24px !important;text-align:center !important;}
.hero-img{text-align:center !important;padding:18px 16px 14px 16px !important;}
.hero-img img{width:210px !important;}
.hero-tag{margin-top:18px !important;font-size:27px !important;}
.hero-logo{width:88px !important;}
.hide-m{display:none !important;}
.show-m{display:inline !important;}
.mc{margin-left:auto !important;margin-right:auto !important;}
.mimg{margin-left:auto !important;margin-right:auto !important;display:block !important;}
.strip-l{padding:8px 0 8px 16px !important;}
.strip-r{padding:8px 14px 8px 4px !important;}
.strip-ico{padding-right:10px !important;}
.strip-img{width:30px !important;height:30px !important;}
.strip-q{font-size:14px !important;}
.strip-btn{padding:6px 13px !important;font-size:13px !important;}
.off-l{padding:24px 18px 0 18px !important;}
.off-1{padding:22px 16px 20px 16px !important;}
.vale-l{width:104px !important;padding:18px 8px !important;}
.vale-l img{width:62px !important;}
.vale-r{padding:16px 14px !important;}
.vale-tit{font-size:23px !important;}
.off-1 .t{font-size:24px !important;}
.off-div{border-right:0 !important;border-bottom:2px dashed #DDE2FF !important;padding:0 0 16px 0 !important;}
.off-r{padding:16px 20px 22px 20px !important;text-align:center !important;}
.sm-img{padding:22px 0 0 0 !important;text-align:center !important;}
.sm-txt{padding:14px 22px 24px 22px !important;text-align:center !important;}
.sm-txt img{margin:0 auto !important;}
.col-txt{padding:26px 22px 4px 22px !important;}
.cards-wrap{padding:12px 14px 4px 14px !important;}
}
</style>
<!--[if mso]><style>.t,.p{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#EEF0F7;">

<!-- Preheader (texto que se ve en la bandeja) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EEF0F7;">{{preheader}}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F7;">
<tr><td align="center" style="padding:32px 12px;">

<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

<!-- ============ HERO ============ -->
<tr><td bgcolor="#3F55F8" style="background:#3F55F8;background-image:linear-gradient(130deg,#5366FF 0%,#283FF3 62%,#1414FF 120%);border-radius:24px 24px 0 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td class="col hero-txt" valign="middle" width="300" style="width:300px;padding:56px 0 56px 44px;">
<table role="presentation" class="mc" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><img class="hero-logo" src="{{assets_url}}/monthly-white.png" width="96" alt="monthly" style="width:96px;height:auto;display:block;"></td>
<td valign="middle" style="padding:0 10px;"><div style="width:1px;height:16px;background:#8E9BFF;font-size:0;line-height:0;">&nbsp;</div></td>
<td valign="middle" class="p" style="font-size:13px;line-height:1.2;color:#C9D1FF;white-space:nowrap;">Plataforma de finanzas con IA</td>
</tr></table>
<p class="t hero-tag" style="margin:22px 0 0 0;font-size:30px;line-height:1.15;font-weight:600;color:#FFFFFF;">¿Cuánto ganaste<br><span style="color:#C8F7E6;">el mes</span> <span style="color:#10E8A0;">pasado?</span></p>
</td>
<td class="col hero-img" valign="middle" align="center" width="256" style="width:256px;padding:44px 20px 24px 4px;font-size:0;line-height:0;">
<img src="{{assets_url}}/monthly-plataforma-2.png" width="232" alt="Estado de resultados en Monthly con la lectura de AskMara" style="width:232px;max-width:100%;height:auto;display:inline-block;">
</td>
</tr>
</table>
</td></tr>

<!-- ============ FRANJA (pegada al encabezado) ============ -->
<tr><td bgcolor="{{despacho_color}}" style="background:{{despacho_color}};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td class="strip-l" valign="middle" style="padding:8px 0 8px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" class="p strip-q" style="font-size:14.5px;line-height:1.25;color:{{despacho_color_texto}};padding-right:10px;white-space:nowrap;"><span class="hide-m">Un beneficio de tu despacho,</span><span class="show-m" style="display:none;mso-hide:all;">De</span></td>
<td valign="middle"><img src="{{despacho_logo_url}}" width="50" alt="{{despacho_nombre}}" style="width:50px;height:auto;border-radius:3px;"></td>
</tr></table>
</td>
<td class="strip-r" valign="middle" align="right" style="padding:8px 32px 8px 8px;white-space:nowrap;">
<table role="presentation" cellpadding="0" cellspacing="0" align="right" style="border-collapse:separate;"><tr><td bgcolor="#10E8A0" style="background:#10E8A0;background-image:linear-gradient(100deg,#8C9BFF 0%,#5366FF 35%,#10E8A0 70%,#5366FF 100%);border-radius:999px;padding:1.5px;box-shadow:0 2px 14px rgba(16,232,160,.45);">
<a href="https://monthly-empezamos.netlify.app/" target="_blank" class="t strip-btn" style="display:inline-block;background:#5366FF;color:#FFFFFF;padding:6px 16px 6px 18px;border-radius:999px;font-size:14px;font-weight:600;white-space:nowrap;">Conocer Monthly&nbsp;&nbsp;&rarr;</a>
</td></tr></table>
</td>
</tr>
</table>
</td></tr>

<!-- ============ INTRO ============ -->
<tr><td bgcolor="#FFFFFF" class="px p" style="background:#FFFFFF;padding:40px 48px 8px 48px;font-size:17px;line-height:1.65;color:#3F467E;">
<p style="margin:0 0 16px 0;">Hola, {{contacto_nombre}}:</p>
<p style="margin:0 0 16px 0;">Tu contabilidad ya está en orden con nosotros. El siguiente paso es usarla para decidir.</p>
<p style="margin:0;">Con <strong style="color:#2D3590;">Monthly</strong> ves cómo cerró <strong style="color:#2D3590;">{{empresa}}</strong> 24 horas después de cada cierre, en una plataforma que entiendes sin ser de finanzas.</p>
</td></tr>

<!-- ============ MONTHLY ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:28px 32px 8px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F5FF;border-radius:20px;">
<tr><td class="col-txt" style="padding:28px 28px 4px 28px;">
<p class="t" style="margin:0;font-size:22px;line-height:1.25;font-weight:600;color:#2D3590;">Tres preguntas que vas a responder cada mes</p>
<p class="p" style="margin:8px 0 0 0;font-size:15.5px;line-height:1.55;color:#3F467E;">Con los números que ya llevamos en {{despacho_nombre}}.</p>
</td></tr>
<tr><td class="cards-wrap" style="padding:14px 16px 4px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td class="col card" width="33%" valign="top" height="100%" style="padding:4px;height:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" height="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px;border-collapse:separate;height:100%;"><tr><td class="p" valign="top" style="padding:16px 14px 18px 14px;font-size:14px;line-height:1.45;color:#6A7392;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="36" height="36" align="center" valign="middle" bgcolor="#EEF0FF" style="width:36px;height:36px;background:#EEF0FF;border-radius:10px;font-size:18px;line-height:36px;">💰</td></tr></table>
<p class="t" style="margin:12px 0 4px 0;font-size:15.5px;line-height:1.25;font-weight:600;color:#2D3590;">¿Cuánto gané?</p>
Tu utilidad real del mes, sin esperar al cierre anual.
</td></tr></table>
</td><td class="col card" width="34%" valign="top" height="100%" style="padding:4px;height:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" height="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px;border-collapse:separate;height:100%;"><tr><td class="p" valign="top" style="padding:16px 14px 18px 14px;font-size:14px;line-height:1.45;color:#6A7392;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="36" height="36" align="center" valign="middle" bgcolor="#EEF0FF" style="width:36px;height:36px;background:#EEF0FF;border-radius:10px;font-size:18px;line-height:36px;">🔎</td></tr></table>
<p class="t" style="margin:12px 0 4px 0;font-size:15.5px;line-height:1.25;font-weight:600;color:#2D3590;">¿Qué cambió?</p>
Qué cuentas subieron o bajaron, y por qué.
</td></tr></table>
</td><td class="col card" width="33%" valign="top" height="100%" style="padding:4px;height:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" height="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px;border-collapse:separate;height:100%;"><tr><td class="p" valign="top" style="padding:16px 14px 18px 14px;font-size:14px;line-height:1.45;color:#6A7392;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="36" height="36" align="center" valign="middle" bgcolor="#EEF0FF" style="width:36px;height:36px;background:#EEF0FF;border-radius:10px;font-size:18px;line-height:36px;">💎</td></tr></table>
<p class="t" style="margin:12px 0 4px 0;font-size:15.5px;line-height:1.25;font-weight:600;color:#2D3590;">¿Cuánto vale?</p>
El valor de tu empresa, mes a mes.
</td></tr></table>
</td>
</tr></table></td></tr>
<tr><td height="18" style="height:18px;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td></tr>

<!-- ============ ASKMARA ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:20px 32px 8px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F3F5FF" style="background:#F3F5FF;background-image:linear-gradient(100deg,#D9DFFB,#D5F5E8);border-radius:20px;border-collapse:separate;">
<tr><td class="col-txt" style="padding:24px 28px 24px 28px;">
<p class="t" style="margin:0;font-size:18px;line-height:1.25;font-weight:600;color:#2D3590;">✨ Y si tienes una duda, se la preguntas a AskMara</p>
<table role="presentation" cellpadding="0" cellspacing="0" align="right" style="margin-top:14px;border-collapse:separate;"><tr><td class="p" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px 16px 4px 16px;padding:10px 14px;font-size:14.5px;line-height:1.45;color:#2D3590;">¿Por qué bajó mi utilidad este mes?</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td height="10" style="height:10px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;"><tr><td class="p" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px 16px 16px 4px;padding:10px 14px;font-size:14.5px;line-height:1.45;color:#3F467E;">El costo subió más que el ingreso. Te muestro qué cuentas lo explican y desde cuándo.</td></tr></table>
<p class="p" style="margin:12px 0 0 0;font-size:12.5px;line-height:1.5;color:#6A7392;">Ejemplo ilustrativo. AskMara responde con los números de tu empresa, en español.</p>
</td></tr>
</table>
</td></tr>

<!-- ============ OFERTA ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:24px 32px 16px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;"><tr><td bgcolor="#5366FF" style="background:#5366FF;background-image:linear-gradient(100deg,#8C9BFF 0%,#5366FF 35%,#10E8A0 70%,#5366FF 100%);border-radius:22px;padding:2px;box-shadow:0 4px 22px rgba(16,232,160,.30);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
<tr>
<td class="vale-l" width="150" align="center" valign="middle" bgcolor="{{despacho_color}}" style="width:150px;background:{{despacho_color}};border-radius:20px 0 0 20px;padding:22px 12px;text-align:center;">
<p style="margin:0;font-size:34px;line-height:1;">&#127873;</p>
<img src="{{despacho_logo_url}}" width="78" alt="{{despacho_nombre}}" style="width:78px;height:auto;display:block;margin:14px auto 0 auto;border-radius:3px;">
<p class="p" style="margin:8px 0 0 0;font-size:12.5px;line-height:1.3;color:{{despacho_color_tenue}};">Exclusivo clientes</p>
</td>
<td class="vale-r" valign="middle" bgcolor="#FFFFFF" style="background:#FFFFFF;border-left:2px dashed #C9D1FF;border-radius:0 20px 20px 0;padding:20px 22px;">
<p class="t vale-tit" style="margin:0;font-size:27px;line-height:1.1;font-weight:600;color:#283FF3;">1er mes gratis.</p>
<p class="p" style="margin:6px 0 0 0;font-size:14px;line-height:20px;color:#3F467E;">Prueba <img src="{{assets_url}}/monthly-blue.png" width="68" alt="Monthly" style="width:68px;height:auto;display:inline-block;vertical-align:-3px;margin:0 2px;"> sin compromiso.</p>
<p class="p" style="margin:14px 0 0 0;font-size:13px;line-height:1.3;color:#6A7392;">Después</p>
<p class="p" style="margin:2px 0 0 0;font-size:13px;line-height:1.6;color:#6A7392;"><span style="font-size:22px;font-weight:700;color:#2D3590;white-space:nowrap;">{{precio}}</span>&nbsp; <span style="white-space:nowrap;">+ IVA/mes</span>&nbsp; <span style="color:#9AA1AB;text-decoration:line-through;">{{precio_original}}</span>&nbsp; <span style="display:inline-block;border:1px solid #9BDCC9;background:#E3F5EF;border-radius:999px;padding:1px 10px;font-size:12.5px;line-height:1.5;color:#2D3590;white-space:nowrap;">{{descuento}} OFF</span></p>
</td>
</tr>
</table>
</td></tr></table>

</td></tr>

<!-- ============ CTA RESPONDER ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:28px 32px 0 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;"><tr>
<td bgcolor="#3346F5" style="background:#3346F5;background-image:linear-gradient(130deg,#5366FF 0%,#283FF3 62%,#1414FF 120%);border-radius:20px;padding:14px 22px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" width="36" style="padding-right:12px;"><img src="{{assets_url}}/icon-responder.png" width="36" height="36" alt="" style="width:36px;height:36px;display:block;"></td>
<td valign="middle"><p class="t" style="margin:0;font-size:16.5px;line-height:1.25;font-weight:600;color:#FFFFFF;">Responde este correo</p>
<p class="p" style="margin:2px 0 0 0;font-size:13.5px;line-height:1.3;color:#DCE1FF;">y activamos tu primer mes gratis</p></td>
</tr></table>
</td>
</tr></table>
</td></tr>

<!-- ============ FIRMA ============ -->
<tr><td bgcolor="#FFFFFF" class="px p" align="center" style="background:#FFFFFF;padding:28px 48px 0 48px;font-size:15px;line-height:1.5;color:#6A7392;text-align:center;">
<span class="t" style="font-size:16px;font-weight:600;color:#2D3590;">{{firma_nombre}}</span><br>{{despacho_nombre}} · <a href="{{despacho_sitio_web}}" target="_blank" style="color:#6A7392;text-decoration:underline;">{{despacho_sitio_texto}}</a>
</td></tr>

<!-- cierre de la tarjeta -->
<tr><td bgcolor="#FFFFFF" height="36" style="background:#FFFFFF;height:36px;font-size:0;line-height:0;border-radius:0 0 24px 24px;">&nbsp;</td></tr>

<!-- ============ FOOTER ============ -->
<tr><td align="center" style="padding:30px 24px 8px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><img src="{{assets_url}}/monthly-blue.png" width="84" alt="monthly" style="width:84px;height:auto;"></td>
<td valign="middle" class="t" style="padding:0 12px;font-size:16px;color:#9AA1AB;">×</td>
<td valign="middle"><img src="{{despacho_logo_url}}" width="56" alt="{{despacho_nombre}}" style="width:56px;height:auto;border-radius:3px;"></td>
</tr></table>
</td></tr>
<tr><td align="center" class="p" style="padding:12px 40px 36px 40px;font-size:12.5px;line-height:1.6;color:#9AA1AB;">
Precio preferente para clientes de {{despacho_nombre}}: {{precio}} + IVA al mes por empresa (precio original {{precio_original}} + IVA). El primer mes es sin costo. Aplican términos y condiciones.<br>
Las cifras de la ilustración son ilustrativas.<br><br>
<a href="{{enlace_baja}}" style="color:#9AA1AB;text-decoration:underline;">Darme de baja</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`,
  },
  {
    dia: 9,
    angulo: "Último aviso",
    asunto: "{{despacho_corto}} - Último aviso: tu beneficio {{anio}} sigue sin activar",
    pre: "Responde este correo y lo activamos hoy. Sin costo y sin trabajo extra para ti.",
    html: `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>{{asunto}}</title>
<link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Titillium+Web:wght@400;600&display=swap" rel="stylesheet">
<style>
body{margin:0;padding:0;background:#EEF0F7;-webkit-text-size-adjust:100%;}
table{border-collapse:collapse;}
img{border:0;display:block;outline:none;text-decoration:none;}
a{text-decoration:none;}
.t{font-family:'Titillium Web',Arial,Helvetica,sans-serif;}
.p{font-family:'PT Sans',Arial,Helvetica,sans-serif;}
@media only screen and (max-width:620px){
.wrap{width:100% !important;}
.px{padding-left:24px !important;padding-right:24px !important;}
.col{display:block !important;width:100% !important;box-sizing:border-box !important;}
.px2{padding-left:16px !important;padding-right:16px !important;}
.hero-txt{padding:36px 24px 0 24px !important;text-align:center !important;}
.hero-img{text-align:center !important;padding:18px 16px 14px 16px !important;}
.hero-img img{width:210px !important;}
.hero-tag{margin-top:18px !important;font-size:27px !important;}
.hero-logo{width:88px !important;}
.hide-m{display:none !important;}
.show-m{display:inline !important;}
.mc{margin-left:auto !important;margin-right:auto !important;}
.mimg{margin-left:auto !important;margin-right:auto !important;display:block !important;}
.strip-l{padding:8px 0 8px 16px !important;}
.strip-r{padding:8px 14px 8px 4px !important;}
.strip-ico{padding-right:10px !important;}
.strip-img{width:30px !important;height:30px !important;}
.strip-q{font-size:14px !important;}
.strip-btn{padding:6px 13px !important;font-size:13px !important;}
.off-l{padding:24px 18px 0 18px !important;}
.off-1{padding:22px 16px 20px 16px !important;}
.vale-l{width:104px !important;padding:18px 8px !important;}
.vale-l img{width:62px !important;}
.vale-r{padding:16px 14px !important;}
.vale-tit{font-size:23px !important;}
.off-1 .t{font-size:24px !important;}
.off-div{border-right:0 !important;border-bottom:2px dashed #DDE2FF !important;padding:0 0 16px 0 !important;}
.off-r{padding:16px 20px 22px 20px !important;text-align:center !important;}
.sm-img{padding:22px 0 0 0 !important;text-align:center !important;}
.sm-txt{padding:14px 22px 24px 22px !important;text-align:center !important;}
.sm-txt img{margin:0 auto !important;}
.col-txt{padding:26px 22px 4px 22px !important;}
.cards-wrap{padding:12px 14px 4px 14px !important;}
}
</style>
<!--[if mso]><style>.t,.p{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#EEF0F7;">

<!-- Preheader (texto que se ve en la bandeja) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EEF0F7;">{{preheader}}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F7;">
<tr><td align="center" style="padding:32px 12px;">

<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

<!-- ============ HERO ============ -->
<tr><td bgcolor="#3F55F8" style="background:#3F55F8;background-image:linear-gradient(130deg,#5366FF 0%,#283FF3 62%,#1414FF 120%);border-radius:24px 24px 0 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td class="col hero-txt" valign="middle" width="300" style="width:300px;padding:56px 0 56px 44px;">
<table role="presentation" class="mc" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><img class="hero-logo" src="{{assets_url}}/monthly-white.png" width="96" alt="monthly" style="width:96px;height:auto;display:block;"></td>
<td valign="middle" style="padding:0 10px;"><div style="width:1px;height:16px;background:#8E9BFF;font-size:0;line-height:0;">&nbsp;</div></td>
<td valign="middle" class="p" style="font-size:13px;line-height:1.2;color:#C9D1FF;white-space:nowrap;">Plataforma de finanzas con IA</td>
</tr></table>
<p class="t hero-tag" style="margin:22px 0 0 0;font-size:30px;line-height:1.15;font-weight:600;color:#FFFFFF;">Tu 1er mes gratis<br><span style="color:#C8F7E6;">sigue</span> <span style="color:#10E8A0;">disponible.</span></p>
</td>
<td class="col hero-img" valign="middle" align="center" width="256" style="width:256px;padding:44px 20px 24px 4px;font-size:0;line-height:0;">
<img src="{{assets_url}}/monthly-plataforma.png" width="232" alt="Plataforma de Monthly" style="width:232px;max-width:100%;height:auto;display:inline-block;">
</td>
</tr>
</table>
</td></tr>

<!-- ============ FRANJA (pegada al encabezado) ============ -->
<tr><td bgcolor="{{despacho_color}}" style="background:{{despacho_color}};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td class="strip-l" valign="middle" style="padding:8px 0 8px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" class="p strip-q" style="font-size:14.5px;line-height:1.25;color:{{despacho_color_texto}};padding-right:10px;white-space:nowrap;"><span class="hide-m">Exclusivo para clientes de</span><span class="show-m" style="display:none;mso-hide:all;">Clientes de</span></td>
<td valign="middle"><img src="{{despacho_logo_url}}" width="50" alt="{{despacho_nombre}}" style="width:50px;height:auto;border-radius:3px;"></td>
</tr></table>
</td>
<td class="strip-r" valign="middle" align="right" style="padding:8px 32px 8px 8px;white-space:nowrap;">
<table role="presentation" cellpadding="0" cellspacing="0" align="right" style="border-collapse:separate;"><tr><td bgcolor="#10E8A0" style="background:#10E8A0;background-image:linear-gradient(100deg,#8C9BFF 0%,#5366FF 35%,#10E8A0 70%,#5366FF 100%);border-radius:999px;padding:1.5px;box-shadow:0 2px 14px rgba(16,232,160,.45);">
<a href="https://monthly-empezamos.netlify.app/" target="_blank" class="t strip-btn" style="display:inline-block;background:#5366FF;color:#FFFFFF;padding:6px 16px 6px 18px;border-radius:999px;font-size:14px;font-weight:600;white-space:nowrap;">Conocer Monthly&nbsp;&nbsp;&rarr;</a>
</td></tr></table>
</td>
</tr>
</table>
</td></tr>

<!-- ============ INTRO ============ -->
<tr><td bgcolor="#FFFFFF" class="px p" style="background:#FFFFFF;padding:40px 48px 8px 48px;font-size:17px;line-height:1.65;color:#3F467E;">
<p style="margin:0 0 16px 0;">Hola, {{contacto_nombre}}:</p>
<p style="margin:0 0 16px 0;">Te escribimos una última vez sobre esto. Como cliente de <strong style="color:#2D3590;">{{despacho_nombre}}</strong> tienes un mes de <strong style="color:#2D3590;">Monthly</strong> sin costo y sin compromiso.</p>
<p style="margin:0;">Más de 200 empresas en México ya la usan para entender sus números cada mes. Si quieres probarla con {{empresa}}, solo responde este correo.</p>
</td></tr>

<!-- ============ COMO EMPIEZAS ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:28px 32px 8px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td class="col-txt" style="padding:0 6px 4px 6px;">
<p class="t" style="margin:0;font-size:22px;line-height:1.25;font-weight:600;color:#2D3590;">Qué pasa cuando respondes</p>
<p class="p" style="margin:8px 0 0 0;font-size:15.5px;line-height:1.55;color:#3F467E;">Cuatro pasos. El primero te toma un minuto.</p>
</td></tr>
<tr><td style="padding:8px 6px 0 6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="top" width="34" style="width:34px;min-width:34px;padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#283FF3" class="p" style="width:30px;height:30px;background:#283FF3;border-radius:999px;font-size:15px;line-height:30px;font-weight:700;color:#FFFFFF;">1</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Respondes este correo</span><br>Con eso activamos tu beneficio.</td></tr><tr><td valign="top" width="34" style="width:34px;min-width:34px;padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#283FF3" class="p" style="width:30px;height:30px;background:#283FF3;border-radius:999px;font-size:15px;line-height:30px;font-weight:700;color:#FFFFFF;">2</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Conectamos tu contabilidad</span><br>Monthly se conecta a nuestro sistema y coordinamos todo entre ambos equipos.<br><span style="display:inline-block;height:26px;margin:10px 16px 0 0;white-space:nowrap;vertical-align:top;"><img src="{{assets_url}}/sys-contpaqi.png" width="26" height="26" alt="" style="width:26px;height:26px;display:inline-block;vertical-align:top;"><span style="display:inline-block;vertical-align:top;margin-left:7px;font-size:13.5px;line-height:26px;color:#6A7392;">CONTPAQi</span></span><span style="display:inline-block;height:26px;margin:10px 16px 0 0;white-space:nowrap;vertical-align:top;"><img src="{{assets_url}}/sys-microsip.png" width="26" height="26" alt="" style="width:26px;height:26px;display:inline-block;vertical-align:top;"><span style="display:inline-block;vertical-align:top;margin-left:7px;font-size:13.5px;line-height:26px;color:#6A7392;">Microsip</span></span><span style="display:inline-block;height:26px;margin:10px 16px 0 0;white-space:nowrap;vertical-align:top;"><img src="{{assets_url}}/sys-contalink.png" width="26" height="26" alt="" style="width:26px;height:26px;display:inline-block;vertical-align:top;"><span style="display:inline-block;vertical-align:top;margin-left:7px;font-size:13.5px;line-height:26px;color:#6A7392;">Contalink</span></span><span style="display:inline-block;vertical-align:top;margin-top:10px;font-size:13.5px;line-height:26px;color:#9AA1AB;">y más</span></td></tr><tr><td valign="top" width="34" style="width:34px;min-width:34px;padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#283FF3" class="p" style="width:30px;height:30px;background:#283FF3;border-radius:999px;font-size:15px;line-height:30px;font-weight:700;color:#FFFFFF;">3</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Recibes tu plataforma lista</span><br>El equipo de Monthly la configura y arranca tu primer mes gratis.</td></tr><tr><td valign="top" width="34" style="width:34px;min-width:34px;padding:10px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#283FF3" class="p" style="width:30px;height:30px;background:#283FF3;border-radius:999px;font-size:15px;line-height:30px;font-weight:700;color:#FFFFFF;">4</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Tú decides si continúas</span><br>Si te sirve, sigues con el precio preferente de {{precio}} + IVA al mes.</td></tr></table>
</td></tr>
</table>
</td></tr>

<!-- ============ LO QUE NO CAMBIA ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:20px 32px 8px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F3F5FF" style="background:#F3F5FF;border-radius:20px;border-collapse:separate;">
<tr><td class="col-txt" style="padding:24px 28px 6px 28px;">
<p class="t" style="margin:0;font-size:20px;line-height:1.25;font-weight:600;color:#2D3590;">Lo que no cambia para ti</p>
</td></tr>
<tr><td style="padding:6px 26px 22px 26px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:16px;"><tr><td style="padding:6px 18px 6px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="top" width="34" style="padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">🤝</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">Seguimos siendo tus contadores</span><br>Tu contabilidad, tus impuestos y tu contacto en el despacho siguen igual.</td></tr><tr><td valign="top" width="34" style="padding:10px 0;border-bottom:1px solid #EEF0F7;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">🖥️</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid #EEF0F7;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">No cambias de sistema</span><br>Monthly se conecta al sistema contable que ya usamos.</td></tr><tr><td valign="top" width="34" style="padding:10px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle" bgcolor="#E8EAF5" style="width:34px;height:34px;background:#E8EAF5;border-radius:10px;font-size:17px;line-height:34px;">⚡</td></tr></table></td>
<td class="p" valign="top" style="padding:10px 0 10px 12px;font-size:14.5px;line-height:1.4;color:#6A7392;"><span class="t" style="font-size:15.5px;font-weight:600;color:#2D3590;">No capturas nada</span><br>Entre el despacho y Monthly coordinamos tu información.</td></tr></table>
</td></tr></table>
</td></tr>
</table>
</td></tr>

<!-- ============ OFERTA ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:24px 32px 16px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;"><tr><td bgcolor="#5366FF" style="background:#5366FF;background-image:linear-gradient(100deg,#8C9BFF 0%,#5366FF 35%,#10E8A0 70%,#5366FF 100%);border-radius:22px;padding:2px;box-shadow:0 4px 22px rgba(16,232,160,.30);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
<tr>
<td class="vale-l" width="150" align="center" valign="middle" bgcolor="{{despacho_color}}" style="width:150px;background:{{despacho_color}};border-radius:20px 0 0 20px;padding:22px 12px;text-align:center;">
<p style="margin:0;font-size:34px;line-height:1;">&#127873;</p>
<img src="{{despacho_logo_url}}" width="78" alt="{{despacho_nombre}}" style="width:78px;height:auto;display:block;margin:14px auto 0 auto;border-radius:3px;">
<p class="p" style="margin:8px 0 0 0;font-size:12.5px;line-height:1.3;color:{{despacho_color_tenue}};">Exclusivo clientes</p>
</td>
<td class="vale-r" valign="middle" bgcolor="#FFFFFF" style="background:#FFFFFF;border-left:2px dashed #C9D1FF;border-radius:0 20px 20px 0;padding:20px 22px;">
<p class="t vale-tit" style="margin:0;font-size:27px;line-height:1.1;font-weight:600;color:#283FF3;">1er mes gratis.</p>
<p class="p" style="margin:6px 0 0 0;font-size:14px;line-height:20px;color:#3F467E;">Prueba <img src="{{assets_url}}/monthly-blue.png" width="68" alt="Monthly" style="width:68px;height:auto;display:inline-block;vertical-align:-3px;margin:0 2px;"> sin compromiso.</p>
<p class="p" style="margin:14px 0 0 0;font-size:13px;line-height:1.3;color:#6A7392;">Después</p>
<p class="p" style="margin:2px 0 0 0;font-size:13px;line-height:1.6;color:#6A7392;"><span style="font-size:22px;font-weight:700;color:#2D3590;white-space:nowrap;">{{precio}}</span>&nbsp; <span style="white-space:nowrap;">+ IVA/mes</span>&nbsp; <span style="color:#9AA1AB;text-decoration:line-through;">{{precio_original}}</span>&nbsp; <span style="display:inline-block;border:1px solid #9BDCC9;background:#E3F5EF;border-radius:999px;padding:1px 10px;font-size:12.5px;line-height:1.5;color:#2D3590;white-space:nowrap;">{{descuento}} OFF</span></p>
</td>
</tr>
</table>
</td></tr></table>

</td></tr>

<!-- ============ CTA RESPONDER ============ -->
<tr><td bgcolor="#FFFFFF" class="px2" style="background:#FFFFFF;padding:28px 32px 0 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;"><tr>
<td bgcolor="#3346F5" style="background:#3346F5;background-image:linear-gradient(130deg,#5366FF 0%,#283FF3 62%,#1414FF 120%);border-radius:20px;padding:14px 22px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" width="36" style="padding-right:12px;"><img src="{{assets_url}}/icon-responder.png" width="36" height="36" alt="" style="width:36px;height:36px;display:block;"></td>
<td valign="middle"><p class="t" style="margin:0;font-size:16.5px;line-height:1.25;font-weight:600;color:#FFFFFF;">Responde este correo</p>
<p class="p" style="margin:2px 0 0 0;font-size:13.5px;line-height:1.3;color:#DCE1FF;">y activamos tu primer mes gratis</p></td>
</tr></table>
</td>
</tr></table>
</td></tr>

<tr><td bgcolor="#FFFFFF" class="px p" style="background:#FFFFFF;padding:22px 48px 0 48px;font-size:14px;line-height:1.55;color:#6A7392;">P. D. Si ahora no es buen momento, no tienes que hacer nada. Este es nuestro último correo sobre el tema.</td></tr>

<!-- ============ FIRMA ============ -->
<tr><td bgcolor="#FFFFFF" class="px p" align="center" style="background:#FFFFFF;padding:28px 48px 0 48px;font-size:15px;line-height:1.5;color:#6A7392;text-align:center;">
<span class="t" style="font-size:16px;font-weight:600;color:#2D3590;">{{firma_nombre}}</span><br>{{despacho_nombre}} · <a href="{{despacho_sitio_web}}" target="_blank" style="color:#6A7392;text-decoration:underline;">{{despacho_sitio_texto}}</a>
</td></tr>

<!-- cierre de la tarjeta -->
<tr><td bgcolor="#FFFFFF" height="36" style="background:#FFFFFF;height:36px;font-size:0;line-height:0;border-radius:0 0 24px 24px;">&nbsp;</td></tr>

<!-- ============ FOOTER ============ -->
<tr><td align="center" style="padding:30px 24px 8px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><img src="{{assets_url}}/monthly-blue.png" width="84" alt="monthly" style="width:84px;height:auto;"></td>
<td valign="middle" class="t" style="padding:0 12px;font-size:16px;color:#9AA1AB;">×</td>
<td valign="middle"><img src="{{despacho_logo_url}}" width="56" alt="{{despacho_nombre}}" style="width:56px;height:auto;border-radius:3px;"></td>
</tr></table>
</td></tr>
<tr><td align="center" class="p" style="padding:12px 40px 36px 40px;font-size:12.5px;line-height:1.6;color:#9AA1AB;">
Precio preferente para clientes de {{despacho_nombre}}: {{precio}} + IVA al mes por empresa (precio original {{precio_original}} + IVA). El primer mes es sin costo. Aplican términos y condiciones.<br>
Las cifras de la ilustración son ilustrativas.<br><br>
<a href="{{enlace_baja}}" style="color:#9AA1AB;text-decoration:underline;">Darme de baja</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`,
  },
];
