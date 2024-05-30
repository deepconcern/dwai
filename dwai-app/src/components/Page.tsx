import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { SxProps, Theme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { CSSProperties, FC, PropsWithChildren } from "react";
import { Link as RouterLink } from "react-router-dom";

export type PageProps = PropsWithChildren<{
    className?: string,
    style?: CSSProperties,
    sx?: SxProps<Theme>,
    title?: string,
}>;

export const Page: FC<PageProps> = ({ children, className, style, sx = [], title }) => (
    <Box sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
    }}>
        <AppBar position="absolute">
            <Toolbar>
                <Link component={RouterLink} sx={{ color: "text.primary", textDecoration: "none" }} to="/">
                    <Typography component="h1" variant="h6">DWAI</Typography>
                </Link>
            </Toolbar>
        </AppBar>
        <Toolbar/>
        <Container className={className} component="main" style={style} sx={[{ flex: 1, my: 3 }, ...(Array.isArray(sx) ? sx : [sx])]}>
            {title && (
                <Typography component="h2" sx={{ mb: 3 }} variant="h4">{title}</Typography>
            )}
            {children}
        </Container>
        <Box component="footer" sx={{ textAlign: "center" }}>
            Copyright {(new Date()).getFullYear()} by Wyatt Barnes
        </Box>
    </Box>
);